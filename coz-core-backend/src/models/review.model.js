import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
    content: { 
        type: String, 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 5 
    },
    images: [{ 
        url: String, 
        publicId: String 
    }],
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    guestName: { 
        type: String, 
        default: null 
    },
    guestEmail: { 
        type: String, 
        default: null 
    },
    product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

reviewSchema.index(
    { product: 1, user: 1 },
    { unique: true, partialFilterExpression: { user: { $ne: null } } }
);

reviewSchema.index(
    { product: 1, guestEmail: 1 },
    { unique: true, partialFilterExpression: { guestEmail: { $ne: null } } }
);

reviewSchema.index({ status: 1 });
reviewSchema.index({ product: 1, createdAt: -1 });

export default model('Review', reviewSchema);