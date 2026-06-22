import { Schema, model } from "mongoose";
import { orderStatus } from "../utils/constants.util.js";

const orderItemSchema = new Schema({
    product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    variant: { 
        type: Schema.Types.ObjectId, 
        ref: 'Variant', 
        required: true 
    },
    size: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    unitPrice: { 
        type: Number, 
        required: true 
    }
});

const orderSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        default: null, 
        index: true 
    },
    guestId: { 
        type: String, 
        default: null, 
        index: true 
    },
    items: [orderItemSchema],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    shippingAddress: {
        fullName: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true 
        },   
        phone: { 
            type: String, 
            required: true 
        },
        street: { 
            type: String, 
            required: true 
        },
        city: { 
            type: String, 
            required: true 
        },
        governorate: { 
            type: String, 
            required: true 
        },
        country: { 
            type: String, 
            default: 'Egypt' 
        },
        postalCode: { 
            type: String, 
            default: null 
        },
        apartment: { 
            type: String, 
            default: null 
        }
    },
    notes: { type: String, default: '' },
    status: { 
        type: String, 
        enum: orderStatus, 
        default: 'pending',
        index: true 
    }
}, { timestamps: true });

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ guestId: 1, status: 1 });
orderSchema.index({ createdAt: -1 }); 

export default model('Order', orderSchema);