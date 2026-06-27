import { Router } from "express";
import { uploadSingleImage, uploadMultipleImages } from "../controllers/uploadToCloadinary.controller.js";
import { upload } from "../utils/cloadinary.util.js";
import { Protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/image", upload.single("image"), uploadSingleImage);
router.post("/images", upload.array("images",20), uploadMultipleImages);

export default router;