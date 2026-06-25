import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { registerValidator, loginValidator, changePasswordValidator , forgotPasswordValidator , verifyOTPValidator , resetPasswordValidator } from "../validators/auth.validator.js";
import { registerUserService, loginUserService,resendVerificationService, changePasswordService , forgotPasswordService , verifyOTPService , resetPasswordService } from "../services/auth.service.js";
import { sendVerificationEmail } from "../utils/email.util.js";
import Lock from "../models/lock.model.js";
import Cart from "../models/cart.model.js";
import Order from '../models/order.model.js';
import RefreshToken from '../models/refreshToken.model.js';


const register = asyncHandler(async (req, res) => {
    const { error } = registerValidator(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const guestId = req.guestId || null;  

    const { user, priceChangedItems } = await registerUserService(req.body, guestId);

    res.status(201).json({
        user,
        priceChangedItems,
    });
});

const login = asyncHandler(async (req, res) => {
    const { error } = loginValidator(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const guestId = req.guestId || null;

    const { user, accessToken, refreshToken, priceChangedItems } = await loginUserService(req.body, guestId);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure:  process.env.NODE_ENV === 'production',
        sameSite: 'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        user,
        accessToken,
        priceChangedItems,   
    });
});


const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { error } = changePasswordValidator(req.body);
    if (error)
        return res.status(400).json({ message: error.details[0].message });

    const updatedUser = await changePasswordService(userId, req.body);
    res.status(200).json({ message: "Password changed successfully" });
});


const forgotPassword = asyncHandler(async (req, res) => {
    const { error } = forgotPasswordValidator(req.body);
    if (error) 
        return res.status(400).json({ message: error.details[0].message });
    
    const { verificationToken, otp } = await forgotPasswordService(req.body.email);
    
    res.status(200).json({
        message: 'OTP sent to email successfully',
        verificationToken,
    });
});

const verifyOTP = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { otp } = req.body;

    const { error } = verifyOTPValidator({ token, otp });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { resetToken } = await verifyOTPService(token, otp);
    res.status(200).json({ message: 'OTP verified successfully', resetToken });
});

const resetPassword = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { password, confirmPassword } = req.body;
    console.log(req.body)

    const { error } = resetPasswordValidator({ password, confirmPassword, token });
    if (error) return res.status(400).json({ message: error.details[0].message });

    await resetPasswordService(token, password, confirmPassword);
    res.status(200).json({ message: 'Password reset successful' });
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: 'Verification token missing' });
    }
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
    });
    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
});

const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const result = await resendVerificationService(email);
    res.status(200).json(result);
});

const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const now = new Date();
    const lock = await Lock.findOneAndUpdate(
        { 
            name: 'admin_delete_lock',
            $or: [
                { lockedAt: null },
                { lockedAt: { $lt: new Date(now.getTime() - 60000) } }
            ]
        },
        { 
            $set: { 
                lockedAt: now, 
                lockedBy: userId,
                expiresAt: new Date(now.getTime() + 60000)
            } 
        },
        { new: true, upsert: true }
    );

    if (lock && lock.lockedBy?.toString() !== userId && lock.lockedAt && lock.lockedAt > new Date(now.getTime() - 60000)) {
        return res.status(409).json({ 
            message: 'Another admin deletion is in progress. Please try again later.' 
        });
    }

    try {
        if (user.role === 'admin') {
            const otherAdmin = await User.findOne({
                role: 'admin',
                _id: { $ne: userId }
            });

            if (!otherAdmin) {
                return res.status(400).json({
                    message: 'Cannot delete the only admin account. Please assign another admin first.'
                });
            }
        }

        await Promise.all([
            Cart.deleteMany({ user: userId }),
            Order.deleteMany({ user: userId }),
            RefreshToken.deleteMany({ user: userId }),
            Review.updateMany(
            { user: userId },
            { 
                $set: { 
                    user: null, 
                    guestName: "Deleted User", 
                    guestEmail: null 
                } 
            }
        )
        ]);

        await User.findByIdAndDelete(userId);

        res.clearCookie('refreshToken');

        res.status(200).json({ 
            message: 'Account deleted successfully'
        });

    } finally {
        await Lock.findOneAndUpdate(
            { name: 'admin_delete_lock', lockedBy: userId },
            { $set: { lockedAt: null, lockedBy: null, expiresAt: null } }
        );
    }
});


export {
    register,
    login,
    changePassword,
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyEmail,
    deleteAccount,
    resendVerification
}
