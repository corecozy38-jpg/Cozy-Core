import asyncHandler from "express-async-handler";
import {
    getAllFaqsService,
    getActiveFaqsService,
    createFaqService,
    updateFaqService,
    deleteFaqService
} from "../services/faq.service.js";

const getAllFaqs = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

    const { faqs, total, totalPages, currentPage } = await getAllFaqsService(page, limit);

    res.status(200).json({
        message: "FAQs retrieved successfully",
        data: faqs,
        pagination: {
            currentPage,
            totalPages,
            totalFaqs: total,
            limit
        }
    });
});

const getActiveFaqs = asyncHandler(async (req, res) => {
    const faqs = await getActiveFaqsService();
    res.status(200).json({
        message: "Active FAQs retrieved successfully",
        data: faqs
    });
});

const createFaq = asyncHandler(async (req, res) => {
    let { question, answer, category, displayOrder, isActive } = req.body;
    const createdBy = req.user._id;

    if (!question || !answer) {
        return res.status(400).json({
            message: "Question and answer (in English) are required"
        });
    }
    category = category.toLowerCase();
    const faq = await createFaqService(
        { question, answer, category, displayOrder, isActive },
        createdBy
    );

    res.status(201).json({
        message: "FAQ created successfully",
        data: faq
    });
});

const updateFaq = asyncHandler(async (req, res) => {
    const { faqId } = req.params;
    let updateData = req.body;
    
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }
    updateData.category = updateData.category.toLowerCase();
    const updatedFaq = await updateFaqService(faqId, updateData);
    res.status(200).json({
        message: "FAQ updated successfully",
        data: updatedFaq
    });
});

const deleteFaq = asyncHandler(async (req, res) => {
    const { faqId } = req.params;
    const result = await deleteFaqService(faqId);
    res.status(200).json(result);
});

export {
    getAllFaqs,
    getActiveFaqs,
    createFaq,
    updateFaq,
    deleteFaq
};