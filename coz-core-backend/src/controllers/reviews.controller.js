import asyncHandler from "express-async-handler";
import {
    getAllReviewsTAdminService,
    getProductReviewsService,
    updateReviewStatusService,
    writeNewReviewService,
    deleteReviewService
} from "../services/reviews.service.js";
import { writeNewReviewValidator } from "../validators/review.validator.js";

const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({ message: "Product id is required" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

    const { reviews, total, totalPages, currentPage } = await getProductReviewsService(productId, page, limit);

    if (!reviews || reviews.length === 0) {
        return res.status(200).json({
            message: "There are no reviews yet, be the first to review",
            data: [],
            pagination: { currentPage: page, limit, totalReviews: 0, totalPages: 0 }
        });
    }

    res.status(200).json({
        message: "Product reviews retrieved successfully",
        data: reviews,
        pagination: { currentPage, totalPages, totalReviews: total, limit }
    });
});

const writeNewReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?._id || null;
    const isLoggedIn = !!userId;

    const { error } = writeNewReviewValidator(req.body, isLoggedIn);
    if (error) {
        return res.status(400).json({
            message: error.details.map(d => d.message).join(", ")
        });
    }

    const review = await writeNewReviewService(productId, userId, req.body);
    res.status(201).json({
        message: "Review submitted successfully, waiting for admin approval",
        data: review
    });
});

const getAllReviewsTAdmin = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status || 'all';
    const isFeatured = req.query.isFeatured || 'false';

    const { reviews, total, totalPages, currentPage } = await getAllReviewsTAdminService(
        page, limit, status, isFeatured
    );

    if (!reviews || reviews.length === 0) {
        return res.status(200).json({
            message: "There are no reviews yet",
            data: [],
            pagination: { currentPage: page, totalPages: 0, limit, totalReviews: 0 }
        });
    }

    res.status(200).json({
        message: "All reviews retrieved successfully",
        data: reviews,
        pagination: { currentPage, totalPages, totalReviews: total, limit }
    });
});

const updateReviewStatus = asyncHandler(async (req, res) => {
    const reviewId = req.params.reviewId;
    const status = req.body.status;

    if (!status || (status.toLowerCase() !== "approved" && status.toLowerCase() !== "rejected")) {
        return res.status(400).json({
            message: "Status must be 'approved' or 'rejected'"
        });
    }

    const result = await updateReviewStatusService(reviewId, status);
    res.status(200).json(result);
});

const deleteReview = asyncHandler(async (req, res) => {
    const reviewId = req.params.reviewId;
    const result = await deleteReviewService(reviewId);
    res.status(200).json(result);
});

export {
    getProductReviews,
    writeNewReview,
    getAllReviewsTAdmin,
    updateReviewStatus,
    deleteReview
};