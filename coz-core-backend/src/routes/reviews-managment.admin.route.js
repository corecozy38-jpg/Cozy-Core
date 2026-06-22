import {Router} from "express"
import { isAdmin, Protect } from "../middlewares/auth.middleware.js";
import { deleteReview, getAllReviewsTAdmin , updateReviewStatus } from "../controllers/reviews.controller.js";

const router= Router();

router.use(Protect, isAdmin);

router.get("/all", getAllReviewsTAdmin);
router.put("/:reviewId/status", updateReviewStatus);
router.delete("/:reviewId", deleteReview);

export default router;