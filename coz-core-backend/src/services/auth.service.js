import User from "../models/user.model.js";
import Cart from '../models/cart.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { sendOTPEmail } from "../utils/email.util.js";
import redis from "../utils/redisClient.util.js";
import RefreshToken from "../models/refreshToken.model.js";
import { sendVerificationEmail } from "../utils/email.util.js";
import { mergeGuestCartWithUser } from "../utils/cart.util.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';


const registerUserService = async (userData, guestId = null) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('Email already exists');

    const { confirmPassword, ...cleanUserData } = userData;

    // create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); 


    const user = new User({
        ...cleanUserData,
        isEmailVerified: false,
        verificationToken,
        verificationTokenExpires
    });

    await user.save();

    let priceChangedItems = [];
    if (guestId) {
        const { priceChangedItems: items } = await mergeGuestCartWithUser(guestId, user._id);
        priceChangedItems = items;
    }

    const query = { user: null };
    if (guestId) query.guestId = guestId;
    if (user.email) query.guestEmail = user.email;
    await Order.updateMany(query, { $set: { user: user._id } });

    await sendVerificationEmail(user.email, verificationToken);

    const accessToken = user.generateToken();
    const refreshToken = user.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create(
        { token: refreshToken, 
            user: user._id, 
            expiresAt, 
            revoked: false 
        });
    return {
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            addresses: user.address,
        },
        
        priceChangedItems,
    };
};



const loginUserService = async (loginData, guestId = null) => {
    const user = await User.findOne({ email: loginData.email });
    console.log(loginData)
    if (!user || !(await user.comparePassword(loginData.password))) {
        throw new Error('Invalid email or password');
    }
    
    if (!user.isEmailVerified) {
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    let priceChangedItems = [];
    if (guestId) {
        const { priceChangedItems: items } = await mergeGuestCartWithUser(guestId, user._id);
        priceChangedItems = items;
    }

    const accessToken = user.generateToken();
    const refreshToken = user.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create(
        { token: refreshToken, 
            user: user._id, 
            expiresAt, 
            revoked: false 
        });

    return {
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            addresses: user.address,
        },
        accessToken,
        refreshToken,
        priceChangedItems,
    };
};


const changePasswordService = async (userId, passwordData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const isMatch = await user.comparePassword(passwordData.currentPassword);
    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
        throw new Error('New password must be different from current password');
    }
    user.password = passwordData.newPassword;
    await user.save();
    await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });
    return user;
}



const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email });
    if (!user)
        throw new Error('User not found');

    await redis.del(`otp:${email}`);
    await redis.del(`otp:attempts:${email}`);

    const otp = generateOTP();

    await redis.set(`otp:${email}`, otp, 'EX', 300);
    await redis.set(`otp:attempts:${email}`, '0', 'EX', 300);

    await sendOTPEmail(email, otp);

    const verificationToken = jwt.sign(
        { id: user._id, purpose: 'OTP_VERIFICATION' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
    );

    return { verificationToken };
};

const verifyOTPService = async (token, otp) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.purpose !== 'OTP_VERIFICATION') {
            throw new Error('Invalid token purpose');
        }
    } catch (err) {
        throw new Error('Session expired, please request a new OTP');
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');

    const email = user.email;

    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
        throw new Error('OTP expired or not found. Please request a new OTP.');
    }

    let attempts = parseInt(await redis.get(`otp:attempts:${email}`)) || 0;

    if (storedOtp !== otp) {
        attempts++;
        await redis.set(`otp:attempts:${email}`, attempts, 'EX', 600);

        if (attempts >= 5) {
            await redis.del(`otp:${email}`);
            await redis.del(`otp:attempts:${email}`);
            throw new Error('Too many failed attempts. Please request a new OTP.');
        }
        throw new Error('Invalid OTP');
    }

    await redis.del(`otp:${email}`);
    await redis.del(`otp:attempts:${email}`);

    const resetToken = jwt.sign(
        { id: user._id, purpose: 'PASSWORD_RESET' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    return { resetToken };
};

const resetPasswordService = async (token, password, confirmPassword) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.purpose !== 'PASSWORD_RESET')
            throw new Error('Unauthorized: This token cannot be used to reset password');
    } catch (err) {
        throw new Error('Invalid or expired reset token');
    }

    const user = await User.findById(decoded.id);
    if (!user)
        throw new Error('User not found');

    user.password = password;
    await user.save();
    await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });
    return { message: 'Password reset successfully' };
};

export {
    registerUserService,
    loginUserService,
    changePasswordService,
    forgotPasswordService,
    verifyOTPService,
    resetPasswordService
}