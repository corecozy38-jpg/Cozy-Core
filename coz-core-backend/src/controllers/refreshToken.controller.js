import asyncHandler from 'express-async-handler';
import RefreshToken from '../models/refreshToken.model.js';
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";

const isProd = process.env.NODE_ENV === 'production';

const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await RefreshToken.updateOne({ token: refreshToken }, { revoked: true });
    }
    const { guestId } = req.body;
    const userId = req.user?._id;
    let cart = null;

    if (userId && guestId) {
        const userCart = await Cart.findOne({ user: userId });
        console.log(userCart);

        if (userCart && userCart.items.length > 0) {
            await Cart.deleteOne({ guestId });
            userCart.user = null;
            userCart.guestId = guestId;
            await userCart.save();
            cart = userCart;
        } else {
            cart = await Cart.findOneAndUpdate(
                { guestId },
                { $setOnInsert: { guestId, items: [] } },
                { upsert: true, new: true }
            );
        }
    } else {
        if (guestId) {
            cart = await Cart.findOneAndUpdate(
                { guestId },
                { $setOnInsert: { guestId, items: [] } },
                { upsert: true, new: true }
            );
        }
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
    });
    res.status(200).json({
        message: "Logged out successfully",
        guestId: guestId,
        cart: cart
    });
});

const GRACE_PERIOD_MS = 15 * 1000; 

const refreshAccessToken = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
        return res.status(401).json({ message: "Refresh token not provided" });
    }

    const refreshTokenDoc = await RefreshToken.findOne({ token: oldRefreshToken });

    if (!refreshTokenDoc || refreshTokenDoc.expiresAt < new Date()) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    if (refreshTokenDoc.revoked) {
        const withinGrace =
            refreshTokenDoc.revokedAt &&
            Date.now() - refreshTokenDoc.revokedAt.getTime() < GRACE_PERIOD_MS;

        if (withinGrace && refreshTokenDoc.replacedByToken) {
            const newDoc = await RefreshToken.findOne({ token: refreshTokenDoc.replacedByToken });
            if (newDoc && !newDoc.revoked) {
                const user = await User.findById(newDoc.user);
                if (user) {
                    const isProd = process.env.NODE_ENV === 'production';
                    res.cookie('refreshToken', newDoc.token, {
                        httpOnly: true,
                        secure: isProd,
                        sameSite: isProd ? 'none' : 'lax',
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    });
                    return res.status(200).json({ accessToken: user.generateToken() });
                }
            }
        }

        await RefreshToken.updateMany(
            { user: refreshTokenDoc.user, revoked: false },
            { revoked: true, revokedAt: new Date() }
        );
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(refreshTokenDoc.user);
    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    const newRefreshToken = user.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({ token: newRefreshToken, user: user._id, expiresAt });

    refreshTokenDoc.revoked = true;
    refreshTokenDoc.revokedAt = new Date();
    refreshTokenDoc.replacedByToken = newRefreshToken;
    await refreshTokenDoc.save();

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const newAccessToken = user.generateToken();
    res.status(200).json({ accessToken: newAccessToken });
});

export {
    logout,
    refreshAccessToken
}