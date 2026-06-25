import { Schema, model } from "mongoose";
import slugify from "slugify";

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: { 
        type: String,
        required: true, 
        unique: true 
    },
    features: [String],
    productType: {
        type: String,
        required: true
    },
    sizeFit: {  
        fitType: { type: String, required: true },   
        modelHeight: { type: Number }, 
        wearingSize: { type: String }   
    },
    sizeGuid: {
        description: {
            type: String,
            default: null
        },
        image: {
            type: {
                url: { type: String, trim: true },
                publicId: { type: String, trim: true },
            },
        }
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewsCount: { type: Number, default: 0 }, 
    collection: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    compareAtPrice: {
        type: Number,
        default: null
    },
    name_ar: { 
        type: String, 
        default: null 
    },
    features_ar: [String],
    sizeFit_ar: {
        fitType: { 
            type: String, 
            default: null 
        },
        modelHeight: { 
            type: Number, 
            default: null 
        },
        wearingSize: { 
            type: String, 
            default: null 
        }
    },
    sizeGuid_ar: {
        description: { 
            type: String, 
            default: null 
        },
        image: { 
            url: String, 
            publicId: String 
        }
    }
}, {
    timestamps: true
});

export default model("Product", productSchema);