import { Router } from "express"
import { createAdminProduct, deleteAdminProductBySlug, updateAdminProductBySlug } from "../controllers/product-managment.controller.js";
import {  updateVariantSizeStock } from "../controllers/variant-managment.controller.js";
import { isAdmin, Protect } from "../middlewares/auth.middleware.js";
const router= Router();

router.use(Protect, isAdmin);

//product 
router.post("/", createAdminProduct);
router.put("/slug/:slug", updateAdminProductBySlug);
router.delete("/slug/:slug", deleteAdminProductBySlug);

router.put("/variants/:variantId/sizes/:sizeName", updateVariantSizeStock);

export default router;

