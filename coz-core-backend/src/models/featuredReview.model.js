import { Schema, model } from "mongoose";

const featuredReviewSchema = new Schema({
    review: {
        type: Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });


featuredReviewSchema.pre('save', async function() {
    if (!this.isNew) return;
    const count = await this.constructor.countDocuments();
    if (count >= 10) {
        throw new Error('Maximum 10 featured reviews allowed');
    }
});

export default model('FeaturedReview', featuredReviewSchema);