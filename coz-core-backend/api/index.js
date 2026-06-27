import { configDotenv } from "dotenv";
configDotenv();

import cookieParser from "cookie-parser";
import express, { json, urlencoded } from "express";
import cors from "cors";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";

import redisClient from "../src/utils/redisClient.util.js";
import { ConnectDB } from "../src/config/connectdb.config.js";

import authRoutes from "../src/routes/auth.route.js";
import productsRoutes from "../src/routes/products.route.js";
import cartRoutes from "../src/routes/cart.route.js";
import ordersRoutes from "../src/routes/order.route.js";
import userRoutes from "../src/routes/user.route.js";
import reviewsRoutes from "../src/routes/reviews.route.js";
import ImageRoutes from "../src/routes/upload.route.js";
import productManagmentRoutes from "../src/routes/product-managment.admin.route.js";
import reviewsManagmentRoutes from "../src/routes/reviews-managment.admin.route.js";
import systemRoutes from "../src/routes/systemCotent.route.js";
import featuredReviewsRoutes from "../src/routes/featuredReviews.route.js";
import adminRoutes from "../src/routes/admin.route.js";

import { errorHandler, notFoundHandler } from "../src/middlewares/notFoundHandler.middleware.js";

const app = express();

app.use(cookieParser());

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:4200',
        ];

        const isVercelCozyCore = origin &&
            origin.includes('vercel.app') &&
            origin.includes('cozy-core');

        if (!origin || allowedOrigins.includes(origin) || isVercelCozyCore) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id']
};

app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));

const sendCommand = (...args) => redisClient.sendCommand(args);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    store: new RedisStore({
        sendCommand,
        prefix: 'rl:api:',
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
        });
    }
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    store: new RedisStore({
        sendCommand,
        prefix: 'rl:strict:',
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again later.',
        });
    }
});

app.use(apiLimiter);

app.use("/auth/login", strictLimiter);
app.use("/auth/register", strictLimiter);
app.use("/auth/forgot-password", strictLimiter);
app.use("/auth/verify-otp", strictLimiter);

let dbConnected = false;
app.use(async (req, res, next) => {
    if (!dbConnected) {
        try {
            await ConnectDB();
            dbConnected = true;
            console.log("DB Connected via middleware");
        } catch (err) {
            console.error("DB Connection Failed:", err.message);
            return res.status(500).json({
                message: "Database connection failed",
                error: err.message
            });
        }
    }
    next();
});

app.use("/admin/upload", ImageRoutes);
app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/admin/products", productManagmentRoutes);
app.use("/admin/reviews", reviewsManagmentRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/user", userRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/public-settings", systemRoutes);
app.use("/featured-reviews", featuredReviewsRoutes);
app.use("/admin/settings", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
} else {
    console.log("Server ready in production mode (Vercel)");
}

export default app;