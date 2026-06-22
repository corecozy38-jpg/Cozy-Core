import asyncHandler from "express-async-handler";
import {
    getAboutService,
    getContactService,
    getTermsService,
    getOrderGuideService,
    updateAboutService,
    updateContactService,
    updateTermsService,
    updateOrderGuideService,
    deleteOrderGuideImageService,
} from "../services/siteSettings.service.js";
import {
    aboutValidator,
    contactValidator,
    termsValidator,
    orderGuideValidator,
} from "../validators/siteSettings.validator.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

const getAbout = asyncHandler(async (req, res) => {
    const data = await getAboutService();
    res.status(200).json({ message: "About page retrieved", data });
});

const getContact = asyncHandler(async (req, res) => {
    const data = await getContactService();
    res.status(200).json({ message: "Contact info retrieved", data });
});

const getTerms = asyncHandler(async (req, res) => {
    const data = await getTermsService();
    res.status(200).json({ message: "Terms & Conditions retrieved", data });
});

const getOrderGuide = asyncHandler(async (req, res) => {
    const data = await getOrderGuideService();
    res.status(200).json({ message: "Order Guide retrieved", data });
});

const updateAbout = asyncHandler(async (req, res) => {
    const { error } = aboutValidator(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const updatedBy = req.user._id;
    const data = await updateAboutService(req.body, updatedBy);
    res.status(200).json({ message: "About page updated", data });
});

const updateContact = asyncHandler(async (req, res) => {
    const { error } = contactValidator(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const updatedBy = req.user._id;
    const data = await updateContactService(req.body, updatedBy);
    res.status(200).json({ message: "Contact info updated", data });
});

const updateTerms = asyncHandler(async (req, res) => {
    const { error } = termsValidator(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const updatedBy = req.user._id;
    const data = await updateTermsService(req.body, updatedBy);
    res.status(200).json({ message: "Terms updated", data });
});

const updateOrderGuide = asyncHandler(async (req, res) => {
    const { error } = orderGuideValidator(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const { images } = req.body;
    if (!images || !Array.isArray(images)) {
        return res.status(400).json({ message: "Images array is required" });
    }
    const updatedBy = req.user._id;
    const data = await updateOrderGuideService(images, updatedBy);
    res.status(200).json({ message: "Order guide updated", data });
});


const deleteOrderGuideImage = asyncHandler(async (req, res) => {
    const { publicId } = req.params;
    if (!publicId)
        return res.status(400).json({ message: "Public ID is required" });
    const updatedBy = req.user._id;
    const images = await deleteOrderGuideImageService(publicId, updatedBy);
    res.status(200).json({ message: "Image deleted", data: images });
});


const getDashboardData = asyncHandler(async (req, res) => {
    const [totalOrders, totalUsers, totalProducts, pendingReviews] = await Promise.all([
        Order.countDocuments(),
        User.countDocuments(),
        Product.countDocuments(),
        Review.countDocuments({ status: 'pending' })
    ]);

    const revenueResult = await Order.aggregate([
        { $match: { status: { $in: ['completed', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const salesOverTime = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'fullName');

    const topProducts = await Order.aggregate([
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                totalSold: { $sum: "$items.quantity" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        { $project: { name: "$product.name", totalSold: 1, price: "$product.price" } }
    ]);

    const recentReviews = await Review.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'fullName')
        .populate('product', 'name slug name_ar');        

    const formattedRecentReviews = recentReviews.map(review => ({
        _id: review._id,
        content: review.content,
        rating: review.rating,
        status: review.status,
        createdAt: review.createdAt,
        reviewerName: review.user?.fullName || review.guestName || 'Anonymous',
        product: {
            _id: review.product?._id,
            name: review.product?.name || '',
            slug: review.product?.slug || '',
            name_ar: review.product?.name_ar || ''
        }
    }));

    res.status(200).json({
        message: "Dashboard data retrieved",
        data: {
            stats: { totalOrders, totalRevenue, totalUsers, totalProducts, pendingReviews: pendingReviews },
            salesOverTime: salesOverTime.map(item => ({ date: item._id, count: item.count, revenue: item.revenue })),
            recentOrders,
            topProducts,
            recentReviews:formattedRecentReviews
        }
    });
});

export {
    getAbout,
    getContact,
    getOrderGuide,
    getTerms,
    updateAbout,
    updateContact,
    updateOrderGuide,
    updateTerms,
    deleteOrderGuideImage,
    getDashboardData
}