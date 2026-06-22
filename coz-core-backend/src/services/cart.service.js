import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import Variant from '../models/variant.model.js';


const findCart = async (userId, guestId) => {
    if (userId) {
        return await Cart.findOne({ user: userId })
            .populate('items.product', 'name slug price compareAtPrice')
            .populate('items.variant', 'colorName images sizes');
    } else if (guestId) {
        return await Cart.findOne({ guestId })
            .populate('items.product', 'name slug price compareAtPrice')
            .populate('items.variant', 'colorName images sizes');
    }
    return null;
};

const getCartService = async ({ userId, guestId }) => {
    let cart = await findCart(userId, guestId);
    
    if (!cart) {
        const newCartData = userId ? { user: userId, items: [] } : { guestId, items: [] };
        cart = new Cart(newCartData);
        await cart.save();
        return { items: [], totalPrice: 0, removedItems: false };
    }

    let removedItems = false;
    const validItems = [];

    for (const item of cart.items) {
        if (!item.product || !item.variant) {
            removedItems = true;
            continue;
        }
        const sizeObj = item.variant.sizes.find(s => s.size === item.size);
        const availableStock = sizeObj ? sizeObj.stock : 0;
        const totalPrice = item.priceAtAddition * item.quantity;

        validItems.push({
            itemId: item._id,
            product: {
                _id: item.product._id,
                name: item.product.name,
                slug: item.product.slug,
                price: item.product.price,
                compareAtPrice: item.product.compareAtPrice
            },
            color: {
                id: item.variant._id,
                name: item.variant.colorName
            },
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.priceAtAddition,
            totalPrice: totalPrice,
            image: item.variant.images?.[0]?.url || null,
            note: item.note || '',
            maxQuantity: availableStock,
            isAvailable: availableStock >= item.quantity
        });
    }

    if (removedItems) {
        cart.items = cart.items.filter(item => item.product && item.variant);
        await cart.save();
    }

    const cartTotal = validItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
        items: validItems,
        totalPrice: cartTotal,
        removedItems
    };
};

const addToCartService = async ({ userId, guestId }, variantId, { size, quantity = 1, note = '' }) => {
    const variant = await Variant.findById(variantId).populate('product');
    if (!variant) throw new Error('Variant not found');

    const product = variant.product;
    if (!product) throw new Error('Product not found');

    const sizeObj = variant.sizes.find(s => s.size === size);
    if (!sizeObj) throw new Error('Invalid size');
    if (sizeObj.stock < quantity) throw new Error(`Only ${sizeObj.stock} items available`);

    let cart = userId
        ? await Cart.findOne({ user: userId })
        : guestId
        ? await Cart.findOne({ guestId })
        : null;

    if (!cart) {
        const newCartData = userId ? { user: userId, items: [] } : { guestId, items: [] };
        cart = new Cart(newCartData);
    }

    const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === product._id.toString() &&
                item.variant.toString() === variant._id.toString() &&
                item.size === size
    );

    if (existingItemIndex !== -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > sizeObj.stock) throw new Error(`Cannot add more than ${sizeObj.stock} items`);
        cart.items[existingItemIndex].quantity = newQuantity;
        if (note) cart.items[existingItemIndex].note = note;
    } else {
        cart.items.push({
            product: product._id,
            variant: variant._id,
            size,
            quantity,
            priceAtAddition: product.price,
            note
        });
    }

    await cart.save();
    return getCartService({ userId, guestId });
};

const updateCartItemQuantityService = async ({ userId, guestId }, itemId, newQuantity) => {
    const cart = await findCart(userId, guestId);
    if (!cart) throw new Error('Cart not found');

    const item = cart.items.id(itemId);
    if (!item) throw new Error('Item not found');

    if (newQuantity < 1) throw new Error('Quantity must be at least 1');

    const variant = await Variant.findById(item.variant);
    if (!variant) throw new Error('Variant no longer exists');

    const sizeObj = variant.sizes.find(s => s.size === item.size);
    if (!sizeObj) throw new Error('Size not available');
    if (sizeObj.stock < newQuantity) throw new Error(`Only ${sizeObj.stock} items available`);

    item.quantity = newQuantity;
    await cart.save();
    return getCartService({ userId, guestId });
};

const removeCartItemService = async ({ userId, guestId }, itemId) => {
    const cart = await findCart(userId, guestId);
    if (!cart) throw new Error('Cart not found');

    const item = cart.items.id(itemId);
    if (!item) throw new Error('Item not found');

    item.deleteOne();
    await cart.save();
    return getCartService({ userId, guestId });
};

const clearCartService = async ({ userId, guestId }) => {
    const cart = await findCart(userId, guestId);
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return { items: [], totalPrice: 0, removedItems: false };
};

export {
    getCartService,
    clearCartService,
    updateCartItemQuantityService,
    removeCartItemService,
    addToCartService
}