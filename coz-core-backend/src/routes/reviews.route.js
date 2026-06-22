import { Router } from "express";
import {
    getProductReviews,
    writeNewReview,
    getAllReviewsTAdmin,
    updateReviewStatus,
    deleteReview
} from "../controllers/reviews.controller.js";
import { Protect, isAdmin, optionalProtect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/product/:productId", getProductReviews);
router.post("/product/:productId",optionalProtect,  writeNewReview);   

export default router;