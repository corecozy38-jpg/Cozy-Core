import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import  FeaturedReview from "../models/featuredReview.model.js";
import { v2 as cloudinary } from "cloudinary";
const recalcProductRating = async (productId) => {
    const result = await Review.aggregate([
        { $match: { product: productId, status: "approved" } },
        {
            $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
        },
    ]);
    const avg = result[0]?.avgRating || 0;
    const count = result[0]?.count || 0;
    await Product.findByIdAndUpdate(productId, {
        rating: avg,
        reviewsCount: count,
    });
};

const getProductReviewsService = async (productId, page, limit) => {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId, status: "approved" })
        .populate("user", "fullName")
        .populate("product", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Review.countDocuments({
        product: productId,
        status: "approved",
    });
    const totalPages = Math.ceil(total / limit);

    const formattedReviews = reviews.map((review) => ({
        _id: review._id,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        reviewerName: review.user?.fullName || review.guestName || "Anonymous",
        images:review.images
    }));

    return {
        reviews: formattedReviews,
        total,
        totalPages,
        currentPage: page,
    };
};

const writeNewReviewService = async (productId, userId, reviewData) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let existingReview = null;
    if (userId) {
        existingReview = await Review.findOne({ product: productId, user: userId });
    } else if (reviewData.guestEmail) {
        existingReview = await Review.findOne({
            product: productId,
            guestEmail: reviewData.guestEmail,
        });
    }
    if (existingReview) {
        throw new Error("You have already reviewed this product");
    }

    const reviewObj = {
        product: productId,
        content: reviewData.content,
        rating: reviewData.rating,
        images: reviewData.images || [],
        status: "pending",
    };

    if (userId) {
        reviewObj.user = userId;
    } else {
        reviewObj.guestName = reviewData.guestName;
        reviewObj.guestEmail = reviewData.guestEmail;
    }

    const review = new Review(reviewObj);
    await review.save();
    return review;
};

const getAllReviewsTAdminService = async (page, limit, status, isFeatured) => {
    const match = {};
    
    if (status && status !== 'all') {
        match.status = status;
    }

    const pipeline = [];

    if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }

    pipeline.push({
        $lookup: {
            from: 'featuredreviews',    
            localField: '_id',
            foreignField: 'review',
            as: 'featuredInfo'
        }
    });

    if (isFeatured === 'true') {
        pipeline.push({
            $match: {
                featuredInfo: { $ne: [] },
                status: 'approved' 
            }
        });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Review.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    );

    const reviews = await Review.aggregate(pipeline);

    const populatedReviews = await Review.populate(reviews, [
        { path: 'user', select: 'fullName' },
        { path: 'product', select: 'name slug' }
    ]);

    const totalPages = Math.ceil(total / limit);

    const formattedReviews = populatedReviews.map((review) => ({
        _id: review._id,
        rating: review.rating,
        content: review.content,
        status: review.status,
        createdAt: review.createdAt,
        reviewerName: review.user?.fullName || review.guestName || "Anonymous",
        product: review.product,
        images: review.images
    }));

    return {
        reviews: formattedReviews,
        total,
        totalPages,
        currentPage: page,
    };
};

const updateReviewStatusService = async (reviewId, status) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    if (review.status === status) {
        throw new Error(`This review is already ${status}`);
    }

    const oldStatus = review.status;
    review.status = status;
    await review.save();

    if (oldStatus === "approved" || status === "approved") {
        await recalcProductRating(review.product);
    }

    return { message: `Review ${status} successfully` };
};

const deleteReviewService = async (reviewId) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    await FeaturedReview.deleteOne({ review: reviewId });

    const publicIds = [];
    if (review.images && review.images.length) {
        for (const img of review.images) {
            if (img.publicId) publicIds.push(img.publicId);
        }
    }
    if (publicIds.length) {
        const deletePromises = publicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId).catch((err) => {
                console.error(`Failed to delete review image ${publicId}:`, err.message);
                return null;
            })
        );
        await Promise.all(deletePromises);
    }

    const wasApproved = review.status === "approved";
    await review.deleteOne();

    if (wasApproved) {
        await recalcProductRating(review.product);
    }

    return { message: "Review deleted successfully" };
};

export {
    getProductReviewsService,
    writeNewReviewService,
    getAllReviewsTAdminService,
    updateReviewStatusService,
    deleteReviewService,
    recalcProductRating,
};
