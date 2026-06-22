import {Router } from 'express';
import { getAllProducts , getProductBySlug } from '../controllers/product.controller.js';

const router = Router();

router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);

export default router;