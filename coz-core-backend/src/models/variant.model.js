import { Schema, model } from "mongoose";
import { ProductSizes } from "../utils/constants.util.js";

const variantSchema = new Schema({
    product :{
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    colorName :{
        type: String,
        required: true
    },
    colorName_ar: { 
        type: String, 
        default: null 
    },
    colorCode :{
        type: String,
        default: null
    },
    images: [{ url: String, publicId: String }],
    sizes: [
        {
            size: { 
                type: String, 
                required: true , 
                enum :ProductSizes 
            },
            stock: { 
                type: Number, 
                required: true, 
                min: 0 
            },
            sku: { 
                type: String, 
                unique: true  , 
                sparse: true 
            },
        }
    ]
}, {
    timestamps: true
});


export default model('Variant', variantSchema);