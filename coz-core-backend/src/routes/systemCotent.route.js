import { sendContactMessage } from "../controllers/contact.controller.js";
import { getActiveFaqs } from "../controllers/faq.controller.js";
import {
    getAbout,
    getAvailableCollections,
    getBanner,
    getContact,
    getOrderGuide,
    getTerms,
} from "../controllers/siteSettings.controller.js";
import { Router } from "express";

const router = Router();

router.get("/active-faqs", getActiveFaqs);
router.get("/about", getAbout);
router.get("/contact-info", getContact);
router.get("/terms", getTerms);
router.get("/order-guide", getOrderGuide);


router.post("/contact-us", sendContactMessage);

router.get("/banner",getBanner);

router.get("/collections", getAvailableCollections);

export default router;
