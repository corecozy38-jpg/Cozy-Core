import { Schema, model } from "mongoose";

const lockSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true  
    },
    lockedAt: { 
        type: Date, 
        default: null 
    },
    lockedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    expiresAt: { 
        type: Date, 
        default: null 
    }
});

export default model("Lock", lockSchema);