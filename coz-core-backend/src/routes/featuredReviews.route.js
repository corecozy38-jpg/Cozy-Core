import { Router } from "express";
import {
    getFeaturedReviews,
    addFeaturedReview,
    removeFeaturedReview
} from "../controllers/featuredReviews.controller.js";
import { Protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getFeaturedReviews);

router.use(Protect, isAdmin);
router.post("/:reviewId", addFeaturedReview);
router.delete("/:reviewId", removeFeaturedReview);

export default router;