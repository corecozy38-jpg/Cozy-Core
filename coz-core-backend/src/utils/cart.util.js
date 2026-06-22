import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

const mergeGuestCartWithUser = async (guestId, userId) => {
    let priceChangedItems = [];
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: userId });

    if (!guestCart || guestCart.items.length === 0) {
        if (guestCart) await Cart.deleteOne({ guestId });
        return { priceChangedItems };
    }

    const getProduct = async (productId) => {
        return await Product.findById(productId).select('name price').lean();
    };

    if (!userCart) {
        for (const item of guestCart.items) {
            const product = await getProduct(item.product);
            if (product && product.price !== item.priceAtAddition) {
                priceChangedItems.push({
                    productId: item.product,
                    name: product.name,
                    oldPrice: item.priceAtAddition,
                    newPrice: product.price,
                });
                item.priceAtAddition = product.price;
            }
        }
        guestCart.user = userId;
        guestCart.guestId = null;
        await guestCart.save();
    } else {
        for (const guestItem of guestCart.items) {
            const product = await getProduct(guestItem.product);
            if (product && product.price !== guestItem.priceAtAddition) {
                priceChangedItems.push({
                    productId: guestItem.product,
                    name: product.name,
                    oldPrice: guestItem.priceAtAddition,
                    newPrice: product.price,
                });
                guestItem.priceAtAddition = product.price;
            }

            const existingIndex = userCart.items.findIndex(
                userItem => userItem.product.toString() === guestItem.product.toString() &&
                            userItem.variant.toString() === guestItem.variant.toString() &&
                            userItem.size === guestItem.size
            );
            if (existingIndex !== -1) {
                userCart.items[existingIndex].quantity += guestItem.quantity;
                userCart.items[existingIndex].priceAtAddition = guestItem.priceAtAddition;
            } else {
                userCart.items.push(guestItem);
            }
        }
        await userCart.save();
        await Cart.deleteOne({ guestId });
    }

    return { priceChangedItems };
};

export { mergeGuestCartWithUser };