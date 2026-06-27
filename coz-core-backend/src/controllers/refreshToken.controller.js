import asyncHandler from 'express-async-handler';
import RefreshToken from '../models/refreshToken.model.js';
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";

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

    res.clearCookie("refreshToken");
    res.status(200).json({
        message: "Logged out successfully",
        guestId: guestId,
        cart: cart 
    });
});

const refreshAccessToken  = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({ message: "Refresh token not provided" });
    }
    const refreshTokenDoc= await RefreshToken.findOne({ token: refreshToken , revoked: false });
    if (!refreshTokenDoc || refreshTokenDoc.expiresAt < new Date()) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    const user = await User.findById(refreshTokenDoc.user);
    if (!user) 
        return res.status(401).json({ message: "User not found" });

    const newAccessToken = user.generateToken();
    res.status(200).json({ accessToken: newAccessToken });
})
export {
    logout,
    refreshAccessToken
}