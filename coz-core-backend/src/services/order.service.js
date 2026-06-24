import { getCartService, clearCartService } from './cart.service.js';
import { sendOrderEmailToMerchant } from '../utils/email.util.js';
import Order from '../models/order.model.js';
import Variant from '../models/variant.model.js';
import User from '../models/user.model.js';

const createOrderService = async ({ userId, guestId }, orderData) => {
    let cartData;
    if (userId) {
        cartData = await getCartService({ userId });
    } else if (guestId) {
        cartData = await getCartService({ guestId });
    } else {
        throw new Error('No user identifier provided');
    }

    if (!cartData.items || cartData.items.length === 0) {
        throw new Error('Cart is empty. Cannot create order.');
    }

    for (const item of cartData.items) {
        const variant = await Variant.findById(item.color.id);
        if (!variant) throw new Error(`Variant not found for product ${item.product.name}`);
        const sizeObj = variant.sizes.find(s => s.size === item.size);
        if (!sizeObj) throw new Error(`Size ${item.size} not available for variant ${variant.colorName}`);
        if (sizeObj.stock < item.quantity) {
            throw new Error(`Only ${sizeObj.stock} items available for ${item.product.name} (${variant.colorName}, ${item.size})`);
        }
    }

    const totalAmount = cartData.totalPrice;

    const orderItems = cartData.items.map(item => ({
        product: item.product._id,
        variant: item.color.id,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.unitPrice
    }));

    const orderDataObj = {
        items: orderItems,
        totalAmount,
        shippingAddress: {
            fullName: orderData.shippingAddress.fullName,
            phone: orderData.shippingAddress.phone,
            email: orderData.shippingAddress.email,   
            street: orderData.shippingAddress.street,
            city: orderData.shippingAddress.city,
            governorate: orderData.shippingAddress.governorate,
            postalCode: orderData.shippingAddress.postalCode || null,
            apartment: orderData.shippingAddress.apartment || null
        },
        notes: orderData.notes || '',
        status: 'pending'
    };

    if (userId) {
        orderDataObj.user = userId;
    } else {
        orderDataObj.guestId = guestId;
        
    }

    const newOrder = new Order(orderDataObj);
    const savedOrder = await newOrder.save();

    for (const item of cartData.items) {
    const updatedVariant = await Variant.findOneAndUpdate(
        {
            _id: item.color.id,
            "sizes.size": item.size,
            "sizes.stock": { $gte: item.quantity } 
        },
        {
            $inc: { "sizes.$.stock": -item.quantity }
        }
    );

    if (!updatedVariant) {
        throw new Error(`Sorry, ${item.product.name} is out of stock or quantity exceeded.`);
    }
}

    if (userId) {
        await clearCartService({ userId });
    } else if (guestId) {
        await clearCartService({ guestId });
    }

    const customerEmail = orderData.shippingAddress.email;
    const customerName = orderData.shippingAddress.fullName;
    sendOrderEmailToMerchant(savedOrder, cartData.items, customerEmail, customerName).catch(err =>
        console.error('Failed to send order email:', err)
    );

    return savedOrder;
};

const getAllOrdersService = async (userId, page, limit) => {
    const skip = (page - 1) * limit;
    const orders = await Order.find({ user: userId })
        .populate('items.product', 'name slug')
        .populate('items.variant', 'colorName images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const ordersWithTotalItems = orders.map(order => ({
        ...order,
        totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }));

    const total = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(total / limit);
    return { orders: ordersWithTotalItems, total, totalPages, currentPage: page };
};

const getOrderByIdService = async (userId, orderId) => {
    const order = await Order.findOne({ _id: orderId, user: userId })
        .populate('items.product', 'name slug images')
        .populate('items.variant', 'colorName images')
        .lean();

    if (!order) {
        throw new Error('Order not found or does not belong to this user');
    }

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    return { ...order, totalItems };
};


const updateOrderStatusService = async (orderId, newStatus) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const oldStatus = order.status;

    if (oldStatus === newStatus) {
        throw new Error('Order already in this status');
    }

    if(oldStatus == 'cancelled' || oldStatus == 'completed') {
        throw new Error(`Order already ${oldStatus}`);
    }

    if (oldStatus === 'pending' && newStatus === 'cancelled') {
    for (const item of order.items) {
        await Variant.updateOne(
            { _id: item.variant, "sizes.size": item.size },
            { $inc: { "sizes.$.stock": item.quantity } }
        );
    }
}

    order.status = newStatus;
    await order.save();

    return order;
};

const getAllOrdersForAdminService = async (page, limit, status) => {
    const filter = status && status !== 'all' ? { status } : {};
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
        .populate('user', 'fullName email')
        .populate('items.product', 'name slug')
        .populate('items.variant', 'colorName images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return { orders, total, totalPages, currentPage: page };
};

export { 
    createOrderService, 
    getAllOrdersService,
    getOrderByIdService,
    updateOrderStatusService,
    getAllOrdersForAdminService
};