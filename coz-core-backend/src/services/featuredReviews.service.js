import FeaturedReview from "../models/featuredReview.model.js";
import Review from "../models/review.model.js";

const getFeaturedReviewsService = async () => {
    const featured = await FeaturedReview.find({ isActive: true })
        .populate({
            path: 'review',
            match: { 
                status: 'approved',
                content: { $ne: '' },
                rating: { $gt: 0 }
            },
            populate: [
                { path: 'user', select: 'fullName' },
                { path: 'product', select: 'name' }
            ]
        })
        .sort({ createdAt: -1 })  
        .lean();

    return featured
        .filter(item => item.review !== null)  
        .map(item => ({
            _id: item._id,
            rating: item.review.rating,
            content: item.review.content,
            reviewerName: item.review.user?.fullName || item.review.guestName || 'Anonymous',
            productName: item.review.product?.name || '',
            reviewId: item.review._id,
            images: item.review.images
        }));
};

const addFeaturedReviewService = async (reviewId, addedBy) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error('Review not found');

    if (review.status !== 'approved') {
        throw new Error('Only approved reviews can be featured');
    }

    const activeCount = await FeaturedReview.countDocuments({ isActive: true });
    if (activeCount >= 10) {
        throw new Error('Maximum 10 active featured reviews allowed');
    }

    const featured = new FeaturedReview({
        review: reviewId,
        addedBy,
        isActive: true
    });

    await featured.save();
    return featured;
};

const removeFeaturedReviewService = async (featuredId) => {
    const featured = await FeaturedReview.findById(featuredId);
    if (!featured) throw new Error('Featured review not found');
    await featured.deleteOne();
    return { message: 'Featured review removed successfully' };
};


export {
    getFeaturedReviewsService,
    addFeaturedReviewService,
    removeFeaturedReviewService,
};