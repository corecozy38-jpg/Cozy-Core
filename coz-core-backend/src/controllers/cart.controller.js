import asyncHandler from 'express-async-handler';
import {
    getCartService,
    addToCartService,
    updateCartItemQuantityService,
    removeCartItemService,
    clearCartService
} from '../services/cart.service.js';
import { cartItemValidator } from '../validators/cart.validator.js';

const getIdentifiers = (req) => ({
    userId: req.user?._id || null,
    guestId: req.guestId || null
});

const getCart = asyncHandler(async (req, res) => {
    const { userId, guestId } = getIdentifiers(req);
    
    if (!userId && !guestId) {
        return res.status(400).json({ message: 'User identifier missing' });
    }
    const cart = await getCartService({ userId, guestId });
    res.status(200).json({ message: 'Cart fetched successfully', data: cart });
});

const addToCart = asyncHandler(async (req, res) => {
    const { userId, guestId } = getIdentifiers(req);
    
    if (!userId && !guestId) {
        return res.status(400).json({ message: 'User identifier missing' });
    }

    const variantId = req.params.variantId;
    const { error } = cartItemValidator({...req.body, variantId});
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updatedCart = await addToCartService({ userId, guestId }, variantId, req.body);
    res.status(200).json({ message: 'Item added to cart successfully', data: updatedCart });
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { userId, guestId } = getIdentifiers(req);
    if (!userId && !guestId) {
        return res.status(400).json({ message: 'User identifier missing' });
    }

    const itemId = req.params.itemId;
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    const updatedCart = await updateCartItemQuantityService({ userId, guestId }, itemId, quantity);
    res.status(200).json({ message: 'Item quantity updated successfully', data: updatedCart });
});

const removeCartItem = asyncHandler(async (req, res) => {
    const { userId, guestId } = getIdentifiers(req);
    if (!userId && !guestId) {
        return res.status(400).json({ message: 'User identifier missing' });
    }

    const itemId = req.params.itemId;
    const updatedCart = await removeCartItemService({ userId, guestId }, itemId);
    res.status(200).json({ message: 'Item removed from cart successfully', data: updatedCart });
});

const clearCart = asyncHandler(async (req, res) => {
    const { userId, guestId } = getIdentifiers(req);
    if (!userId && !guestId) {
        return res.status(400).json({ message: 'User identifier missing' });
    }

    const result = await clearCartService({ userId, guestId });
    res.status(200).json({ message: 'Cart cleared successfully', data: result });
});

export {
    getCart,
    clearCart,
    removeCartItem,
    updateCartItem,
    addToCart
}