import { Schema, model } from "mongoose";

const cartItemSchema = new Schema({
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
    priceAtAddition: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        default: ''
    }
});

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: undefined,   
        index: true,
        unique: true,
        sparse: true             
    },
    guestId: {
        type: String,
        default: undefined,      
        index: true,
        unique: true,
        sparse: true
    },
    items: [cartItemSchema],
}, {
    timestamps: true,
});


const Cart = model('Cart', cartSchema);
export default Cart;