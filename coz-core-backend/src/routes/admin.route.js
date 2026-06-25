import {
    getFeaturedReviews,
    addFeaturedReview,
    removeFeaturedReview
} from "../controllers/featuredReviews.controller.js";

import {
    getAllFaqs,
    getActiveFaqs,
    createFaq,
    updateFaq,
    deleteFaq
} from "../controllers/faq.controller.js";

import {
    updateAbout,
    updateContact,
    updateOrderGuide,
    updateTerms,
    deleteOrderGuideImage,
    getDashboardData,
    updateBanner,
    updateAttributes
} from "../controllers/siteSettings.controller.js"
import { Router} from "express"
import { isAdmin, Protect } from "../middlewares/auth.middleware.js";
import { getAllOrdersForAdmin, updateOrderStatus } from "../controllers/order.controller.js";

const router= Router();

router.use(Protect , isAdmin);

//  Testimonials 
router.get("/featured-reviews", getFeaturedReviews);
router.post("/featured-reviews", addFeaturedReview);
router.delete("/featured-reviews/:id", removeFeaturedReview);


//  FAQ 
router.get("/faqs", getAllFaqs);
router.get("/faqs/active", getActiveFaqs); 
router.post("/faq", createFaq);
router.put("/faq/:faqId", updateFaq);
router.delete("/faq/:faqId", deleteFaq);


// SYSTEM CONTENT
router.put("/contact", updateContact);
router.put("/about", updateAbout);
router.put("/order-guide", updateOrderGuide);
router.delete("/order-guide/:publicId", deleteOrderGuideImage);
router.put("/terms", updateTerms);
router.get("/dashboard", getDashboardData);



//ORDERS
router.get("/orders", getAllOrdersForAdmin);
router.put("/orders/:orderId/status", updateOrderStatus);

//BANNER
router.put("/banner", updateBanner);


router.put('/attributes', updateAttributes);
export default router;