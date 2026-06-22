import asyncHandler from 'express-async-handler';
import { createOrderService, getAllOrdersForAdminService, getAllOrdersService, getOrderByIdService, updateOrderStatusService } from '../services/order.service.js';
import { createOrderValidator } from '../validators/order.validator.js';

const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user?._id || null;
    const guestId = req.guestId || null;

    if (!userId && !guestId) {
        return res.status(400).json({ message: 'User identifier missing' });
    }

    const { shippingAddress, notes } = req.body;

    const { error } = createOrderValidator({ shippingAddress, notes });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const order = await createOrderService({ userId, guestId }, { shippingAddress, notes });
    res.status(201).json({ message: 'Order placed successfully', data: order });
});

const getAllOrders = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        return res.status(401).json({ message: 'Authentication required to view orders' });
    }
    const userId = req.user._id;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

    const { orders, total, totalPages, currentPage } = await getAllOrdersService(userId, page, limit);

    if (!orders || orders.length === 0) {
        return res.status(200).json({
            success: true,
            message: "There are no orders yet",
            data: [],
            pagination: { currentPage: page, totalOrders: total, totalPages: 0 }
        });
    }

    res.status(200).json({
        success: true,
        message: "Your orders retrieved successfully",
        data: orders,
        pagination: { currentPage, totalOrders: total, totalPages, limit }
    });
});

const getOrderById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await getOrderByIdService(userId, orderId);
    res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
    });
});



const getAllOrdersForAdmin = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status || 'all';

    const { orders, total, totalPages, currentPage } = await getAllOrdersForAdminService(page, limit, status);

    res.status(200).json({
        message: 'Orders retrieved successfully',
        data: orders,
        pagination: { currentPage, totalPages, totalOrders: total, limit }
    });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses
        = ['pending','completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedOrder = await updateOrderStatusService(orderId, status);

    res.status(200).json({
        message: `Order status updated to ${status}`,
        data: updatedOrder
    });
});


export { 
    createOrder, 
    getAllOrders,
    getOrderById,
    getAllOrdersForAdmin,
    updateOrderStatus
};