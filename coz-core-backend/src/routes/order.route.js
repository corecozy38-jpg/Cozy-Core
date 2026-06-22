import { Router } from "express";
import { createOrder, getAllOrders, getOrderById } from "../controllers/order.controller.js";
import { optionalProtect, Protect } from "../middlewares/auth.middleware.js";

const router=Router();


router.post("/",optionalProtect,createOrder);
router.get("/",Protect,getAllOrders);
router.get('/:orderId',Protect, getOrderById);   

export default router;
