import asyncHandler from "express-async-handler";
import {
    getFeaturedReviewsService,
    addFeaturedReviewService,
    removeFeaturedReviewService,
} from "../services/featuredReviews.service.js";

const getFeaturedReviews = asyncHandler(async (req, res) => {
    const featured = await getFeaturedReviewsService();
    res.status(200).json({
        message: "Featured reviews retrieved successfully",
        data: featured
    });
});

const addFeaturedReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.body;
    const addedBy = req.user._id;

    if (!reviewId) {
        return res.status(400).json({ message: "Review ID is required" });
    }

    const featured = await addFeaturedReviewService(reviewId, addedBy);
    res.status(201).json({
        message: "Review added to featured successfully",
        data: featured
    });
});

const removeFeaturedReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await removeFeaturedReviewService(id);
    res.status(200).json(result);
});


export {
    getFeaturedReviews,
    addFeaturedReview,
    removeFeaturedReview,
};