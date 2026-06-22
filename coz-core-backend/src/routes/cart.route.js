import { Router } from 'express';
import { addToCart, removeCartItem , getCart, updateCartItem , clearCart} from '../controllers/cart.controller.js';
import { optionalProtect, Protect } from '../middlewares/auth.middleware.js';

const router = Router();


router.get("/",optionalProtect,getCart);
router.post("/items/:variantId",optionalProtect,addToCart);
router.put("/items/:itemId",optionalProtect,updateCartItem);
router.delete("/items/:itemId",optionalProtect,removeCartItem);
router.delete("/",optionalProtect,clearCart)


export default router;