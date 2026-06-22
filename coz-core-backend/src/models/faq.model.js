import { Schema, model } from "mongoose";

const faqSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    question_ar: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    answer_ar: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'shipping', 'returns', 'payment', 'products'],
        default: 'general'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });


faqSchema.pre('save', async function() {
    if (!this.isNew) return;
    if (this.isActive) {
        const activeCount = await this.constructor.countDocuments({ isActive: true });
        if (activeCount >= 10) {
            throw new Error('Maximum 10 active FAQs allowed');
        }
    }
});

export default model('Faq', faqSchema);