import { Schema, model } from "mongoose";
import { roles } from "../utils/constants.util.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: roles,
            default: "user",
        },
        address: [
            {
                governorate: {
                    type: String,
                    required: true,
                },
                city: {
                    type: String,
                    required: true,
                },
                street: {
                    type: String,
                    required: true,
                },
                apartment: { type: String, default: null },
                postalCode: { type: String, default: null },
                country: {
                    type: String,
                    default: 'Egypt'
                }
            },
        ],
        phone: {
            type: String,
            required: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            type: String,
            default: null
        },
        verificationTokenExpires: {
            type: Date,
            default: null
        },
        lastVerificationEmailSent: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
    },
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            id: this._id,
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
}

export default model("User", userSchema);