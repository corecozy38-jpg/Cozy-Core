import Faq from "../models/faq.model.js";
import { translateEnToAr } from "../utils/geminiTranslation.util.js";

const getAllFaqsService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const faqs = await Faq.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    const total = await Faq.countDocuments();
    const totalPages = Math.ceil(total / limit);
    return { faqs, total, totalPages, currentPage: page };
};

const getActiveFaqsService = async () => {
    const faqs = await Faq.find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();
    return faqs;
};

const createFaqService = async (faqData, createdBy) => {
    const activeCount = await Faq.countDocuments({ isActive: true });
    if (faqData.isActive !== false && activeCount >= 10) {
        throw new Error("Maximum 10 active FAQs allowed");
    }

    const question_ar = await translateEnToAr(faqData.question);
    const answer_ar = await translateEnToAr(faqData.answer);

    const faq = new Faq({
        question: faqData.question,
        question_ar: question_ar || faqData.question,
        answer: faqData.answer,
        answer_ar: answer_ar || faqData.answer,
        category: faqData.category || 'general',
        isActive: faqData.isActive !== undefined ? faqData.isActive : false,
        createdBy
    });

    await faq.save();
    return faq;
};

const updateFaqService = async (faqId, updateData) => {
    const faq = await Faq.findById(faqId);
    if (!faq) throw new Error("FAQ not found");

    if (updateData.isActive !== undefined && updateData.isActive === true && !faq.isActive) {
        const activeCount = await Faq.countDocuments({
            isActive: true,
            _id: { $ne: faqId } 
        });
        if (activeCount >= 10) {
            throw new Error("Cannot activate more than 10 FAQs. Maximum active FAQs reached.");
        }
    }

    if (updateData.question !== undefined) {
        faq.question = updateData.question;
        faq.question_ar = await translateEnToAr(updateData.question) || updateData.question;
    }

    if (updateData.answer !== undefined) {
        faq.answer = updateData.answer;
        faq.answer_ar = await translateEnToAr(updateData.answer) || updateData.answer;
    }

    if (updateData.category !== undefined) faq.category = updateData.category;
    if (updateData.isActive !== undefined) faq.isActive = updateData.isActive;

    await faq.save();
    return faq;
};

const deleteFaqService = async (faqId) => {
    const faq = await Faq.findById(faqId);
    if (!faq) throw new Error("FAQ not found");
    await faq.deleteOne();
    return { message: "FAQ deleted successfully" };
};

export {
    getAllFaqsService,
    getActiveFaqsService,
    createFaqService,
    updateFaqService,
    deleteFaqService
};