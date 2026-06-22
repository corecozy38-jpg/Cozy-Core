import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const Protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token not provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("_id role");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const optionalProtect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("_id role");
            req.user = user || null;
        } catch (error) {
            req.user = null;
        }
    } else {
        req.user = null;
    }

    const guestIdHeader = req.headers['x-guest-id'];
    if (guestIdHeader && typeof guestIdHeader === 'string' && guestIdHeader.trim() !== '') {
        req.guestId = guestIdHeader.trim();
    } else {
        req.guestId = null;
    }

    next();
};
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
export { Protect, optionalProtect, isAdmin };