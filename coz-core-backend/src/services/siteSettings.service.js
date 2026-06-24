import SiteSettings from "../models/siteSettings.model.js";
import { v2 as cloudinary } from "cloudinary";
import { translateEnToAr } from "../utils/geminiTranslation.util.js";

const getSiteSettingsService = async () => {
    let settings = await SiteSettings.findOne();
    if (!settings) {
        settings = new SiteSettings();
        await settings.save();
    }
    return settings;
};

const getAboutService = async () => {
    const settings = await getSiteSettingsService();
    return {
        title: settings.about.title,
        title_ar: settings.about.title_ar,
        description: settings.about.description,
        description_ar: settings.about.description_ar,
    };
};

const getContactService = async () => {
    const settings = await getSiteSettingsService();
    return {
        phone: settings.contact.phone,
        email: settings.contact.email,
        instagram: settings.contact.instagram,
    };
};

const getTermsService = async () => {
    const settings = await getSiteSettingsService();
    console.log(settings.terms);
    
    return settings.terms;
};

const getOrderGuideService = async () => {
    const settings = await getSiteSettingsService();
    return {
        images: settings.orderGuide.images.sort((a, b) => a.displayOrder - b.displayOrder),
        isActive: settings.orderGuide.isActive,
    };
};

const updateAboutService = async (aboutData, updatedBy) => {
    const settings = await getSiteSettingsService();
    if (aboutData.title !== undefined) {
        settings.about.title = aboutData.title;
        settings.about.title_ar = (await translateEnToAr(aboutData.title)) || aboutData.title;
    }
    if (aboutData.description !== undefined) {
        settings.about.description = aboutData.description;
        settings.about.description_ar = (await translateEnToAr(aboutData.description)) || aboutData.description;
    }
    settings.updatedBy = updatedBy;
    await settings.save();
    return settings.about;
};

const updateContactService = async (contactData, updatedBy) => {
    const settings = await getSiteSettingsService();
    if (contactData.phone !== undefined) settings.contact.phone = contactData.phone;
    if (contactData.email !== undefined) settings.contact.email = contactData.email;
    if (contactData.instagram !== undefined) settings.contact.instagram = contactData.instagram;
    settings.updatedBy = updatedBy;
    await settings.save();
    return settings.contact;
};

const updateTermsService = async (termsData, updatedBy) => {
    const settings = await getSiteSettingsService();

    if (termsData.terms !== undefined && Array.isArray(termsData.terms)) {
        const translatedTerms = await Promise.all(termsData.terms.map(async (term) => {
            const newTerm = { ...term };
            newTerm.title_ar = term.title ? await translateEnToAr(term.title) || term.title : '';
            newTerm.content_ar = term.content ? await translateEnToAr(term.content) || term.content : '';
            return newTerm;
        }));
        settings.terms = translatedTerms;
    }

    settings.updatedBy = updatedBy;
    await settings.save();
    return settings.terms;
};
const updateOrderGuideService = async (imagesData, updatedBy) => {
    const settings = await getSiteSettingsService();
    if (!Array.isArray(imagesData)) throw new Error("Images must be an array");
    settings.orderGuide.images = imagesData.map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        displayOrder: img.displayOrder !== undefined ? img.displayOrder : index,
    }));
    settings.updatedBy = updatedBy;
    await settings.save();
    return settings.orderGuide;
};



const deleteOrderGuideImageService = async (publicId, updatedBy) => {
    const settings = await getSiteSettingsService();
    settings.orderGuide.images = settings.orderGuide.images.filter(
        (img) => img.publicId !== publicId,
    );

    await cloudinary.uploader.destroy(publicId);
    settings.updatedBy = updatedBy;
    await settings.save();
    return settings.orderGuide;
};

const updateBannerService = async (bannerData, updatedBy) => {
    const settings = await getSiteSettingsService();

    const oldPublicId = settings.banner.publicId;

    if (bannerData.url !== undefined) {
        settings.banner.url = bannerData.url;
    }
    if (bannerData.publicId !== undefined) {
        settings.banner.publicId = bannerData.publicId;
    }

    if (oldPublicId && oldPublicId !== bannerData.publicId) {
        try {
            await cloudinary.uploader.destroy(oldPublicId);
        } catch (error) {
            console.error('Failed to delete old banner from Cloudinary:', error.message);
        }
    }

    settings.updatedBy = updatedBy;
    await settings.save();
    return settings.banner;
};


const getBannerService = async () => {
    const settings = await getSiteSettingsService();
    return settings.banner;  
};

export {
    getAboutService,
    getContactService,
    getOrderGuideService,
    getTermsService,
    updateContactService,
    updateAboutService,
    updateOrderGuideService,
    deleteOrderGuideImageService,
    updateTermsService,
    updateBannerService,
    getBannerService
};




