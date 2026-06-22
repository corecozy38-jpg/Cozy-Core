import { sendContactEmail } from "../utils/email.util.js";
import asyncHandler from "express-async-handler"

export const sendContactMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required." });
    }

    await sendContactEmail({ name, email, subject, message });

    res.status(200).json({
        message: "Your message has been sent successfully.",
    });
});