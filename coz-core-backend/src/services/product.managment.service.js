import Product from "../models/product.model.js";
import Variant from "../models/variant.model.js";
import Review from "../models/review.model.js";
import {
    translateProductToArabic,
    translateEnToAr,
    translateArrayEnToAr
} from "../utils/geminiTranslation.util.js";
import { v2 as cloudinary } from "cloudinary";
import slugify from 'slugify';
import { getSiteSettingsService } from "./siteSettings.service.js";

const generateUniqueSlug = async (name) => {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
    }
    return slug;
};

const generateSku = (productName, colorName, size, index = 0) => {
    const prefix = productName.slice(0, 4).toUpperCase();
    const color = colorName.slice(0, 3).toUpperCase();
    let sku = `${prefix}-${color}-${size}`;
    if (index > 0) sku += `-${index}`;
    return sku;
};

const validateProductAttributes = async (productData, variantsData) => {
    const settings = await getSiteSettingsService();

    const validProductTypes = settings.productTypes.map(t => t.name);
    if (!validProductTypes.includes(productData.productType)) {
        throw new Error(`Invalid product type: ${productData.productType}`);
    }

    const validCollections = settings.collectionTypes.map(c => c.name);
    if (!validCollections.includes(productData.collection)) {
        throw new Error(`Invalid collection: ${productData.collection}`);
    }

    const validColors = settings.colors.map(c => c.name);
    const validSizes = settings.sizes;

    for (const variant of variantsData) {
        if (!validColors.includes(variant.colorName)) {
            throw new Error(`Invalid color: ${variant.colorName}`);
        }
        for (const sizeObj of variant.sizes) {
            if (!validSizes.includes(sizeObj.size)) {
                throw new Error(`Invalid size: ${sizeObj.size}`);
            }
        }
    }
};

const createProductService = async (productData) => {
    await validateProductAttributes(productData, productData.variants);

    const slug = await generateUniqueSlug(productData.name);

    const textsToTranslate = {
        name: productData.name,
        features: productData.features || [],
        fitType: productData.sizeFit?.fitType || '',
        sizeGuideDesc: productData.sizeGuid?.description || '',
        colorNames: productData.variants?.map(v => v.colorName) || []
    };

    const translations = await translateProductToArabic(textsToTranslate);

    const name_ar = translations.name_ar || productData.name;
    const features_ar = translations.features_ar || productData.features || [];
    const colorNames_ar = translations.colorNames_ar || [];

    let sizeFit_ar = null;
    if (productData.sizeFit && productData.sizeFit.fitType) {
        const fitType_ar = translations.fitType_ar || productData.sizeFit.fitType;
        sizeFit_ar = {
            fitType: fitType_ar,
            modelHeight: productData.sizeFit.modelHeight || null,
            wearingSize: productData.sizeFit.wearingSize || null,
        };
    }

    let sizeGuid_ar = null;
    if (productData.sizeGuid && productData.sizeGuid.description) {
        const desc_ar = translations.sizeGuideDesc_ar || productData.sizeGuid.description;
        sizeGuid_ar = {
            description: desc_ar,
            image: productData.sizeGuid.image || null,
        };
    }

    const product = new Product({
        name: productData.name,
        slug,
        productType: productData.productType,
        collection: productData.collection,
        features: productData.features,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice || null,
        sizeFit: productData.sizeFit,
        sizeGuid: productData.sizeGuid || null,
        name_ar,
        features_ar,
        sizeFit_ar,
        sizeGuid_ar,
    });

    await product.save();

    if (productData.variants && productData.variants.length) {
        for (let i = 0; i < productData.variants.length; i++) {
            const variantData = productData.variants[i];
            const colorName_ar = colorNames_ar[i] || variantData.colorName;

            const processedSizes = variantData.sizes.map((sizeObj, idx) => {
                let sku = sizeObj.sku;
                if (!sku || sku.trim() === '') {
                    sku = generateSku(productData.name, variantData.colorName, sizeObj.size, idx);
                }
                return {
                    ...sizeObj,
                    sku
                };
            });

            const variant = new Variant({
                product: product._id,
                colorName: variantData.colorName,
                colorName_ar,
                colorCode: variantData.colorCode || null,
                images: variantData.images,
                sizes: processedSizes,
            });
            await variant.save();
        }
    }

    const variants = await Variant.find({ product: product._id });

    return {
        ...product.toObject(),
        variants
    };
};

const updateProductService = async (slug, updateData) => {
    const product = await Product.findOne({ slug });
    if (!product) throw new Error("Product not found");

    if (updateData.productType || updateData.collection || updateData.variants) {
        const tempProductData = {
            productType: updateData.productType || product.productType,
            collection: updateData.collection || product.collection,
        };
        const tempVariantsData = updateData.variants || product.variants;
        await validateProductAttributes(tempProductData, tempVariantsData);
    }

    const textsToTranslate = {};
    let shouldTranslate = false;

    if (updateData.name !== undefined && updateData.name !== product.name) {
        textsToTranslate.name = updateData.name;
        shouldTranslate = true;
    }
    if (updateData.features !== undefined && JSON.stringify(updateData.features) !== JSON.stringify(product.features)) {
        textsToTranslate.features = updateData.features;
        shouldTranslate = true;
    }
    if (updateData.sizeFit?.fitType !== undefined && updateData.sizeFit.fitType !== product.sizeFit?.fitType) {
        textsToTranslate.fitType = updateData.sizeFit.fitType;
        shouldTranslate = true;
    }
    if (updateData.sizeGuid?.description !== undefined && updateData.sizeGuid.description !== product.sizeGuid?.description) {
        textsToTranslate.sizeGuideDesc = updateData.sizeGuid.description;
        shouldTranslate = true;
    }

    let translations = {};
    if (shouldTranslate && Object.keys(textsToTranslate).length > 0) {
        translations = await translateProductToArabic(textsToTranslate);
    }

    if (updateData.name !== undefined && updateData.name !== product.name) {
        product.name = updateData.name;
        product.name_ar = translations.name_ar || updateData.name;
        product.slug = await generateUniqueSlug(updateData.name);
    }

    if (updateData.productType !== undefined)
        product.productType = updateData.productType;
    if (updateData.collection !== undefined)
        product.collection = updateData.collection;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.compareAtPrice !== undefined)
        product.compareAtPrice = updateData.compareAtPrice;

    if (updateData.features !== undefined) {
        product.features = updateData.features;
        product.features_ar = translations.features_ar || await translateArrayEnToAr(updateData.features);
    }

    if (updateData.sizeFit) {
        if (
            updateData.sizeFit.fitType !== undefined &&
            updateData.sizeFit.fitType !== product.sizeFit?.fitType
        ) {
            product.sizeFit.fitType = updateData.sizeFit.fitType;
            if (!product.sizeFit_ar) product.sizeFit_ar = {};
            product.sizeFit_ar.fitType = translations.fitType_ar || updateData.sizeFit.fitType;
        }
        if (updateData.sizeFit.modelHeight !== undefined)
            product.sizeFit.modelHeight = updateData.sizeFit.modelHeight;
        if (updateData.sizeFit.wearingSize !== undefined)
            product.sizeFit.wearingSize = updateData.sizeFit.wearingSize;
    }

    if (updateData.sizeGuid) {
        if (!product.sizeGuid) product.sizeGuid = {};
        if (
            updateData.sizeGuid.description !== undefined &&
            updateData.sizeGuid.description !== product.sizeGuid?.description
        ) {
            product.sizeGuid.description = updateData.sizeGuid.description;
            if (!product.sizeGuid_ar) product.sizeGuid_ar = {};
            product.sizeGuid_ar.description = translations.sizeGuideDesc_ar || updateData.sizeGuid.description;
        }
        if (updateData.sizeGuid.image !== undefined) {
            product.sizeGuid.image = updateData.sizeGuid.image;
        }
    }

    if (updateData.variants !== undefined && Array.isArray(updateData.variants)) {
        await Variant.deleteMany({ product: product._id });

        const colorNamesToTranslate = updateData.variants.map(v => v.colorName);
        let colorNames_ar = [];
        if (colorNamesToTranslate.length > 0) {
            const colorTranslationResult = await translateArrayEnToAr(colorNamesToTranslate);
            colorNames_ar = colorTranslationResult;
        }

        for (let i = 0; i < updateData.variants.length; i++) {
            const variantData = updateData.variants[i];
            let colorName_ar = variantData.colorName_ar || null;
            if (variantData.colorName && !variantData.colorName_ar) {
                colorName_ar = colorNames_ar[i] || variantData.colorName;
            }

            const processedSizes = variantData.sizes.map((sizeObj, idx) => {
                let sku = sizeObj.sku;
                if (!sku || sku.trim() === '') {
                    sku = generateSku(product.name, variantData.colorName, sizeObj.size, idx);
                }
                return {
                    ...sizeObj,
                    sku
                };
            });

            const variant = new Variant({
                product: product._id,
                colorName: variantData.colorName,
                colorName_ar,
                colorCode: variantData.colorCode || null,
                images: variantData.images || [],
                sizes: processedSizes,
            });
            await variant.save();
        }
    }

    await product.save();

    const variants = await Variant.find({ product: product._id });
    return {
        ...product.toObject(),
        variants
    };
};

const deleteProductService = async (slug) => {
    const product = await Product.findOne({ slug });
    if (!product) throw new Error("Product not found");

    const variants = await Variant.find({ product: product._id });

    const publicIds = [];
    if (variants && variants.length) {
        for (const variant of variants) {
            if (variant.images && variant.images.length) {
                for (const img of variant.images) {
                    if (img.publicId) publicIds.push(img.publicId);
                }
            }
        }
    }

    if (publicIds.length) {
        const deletePromises = publicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId).catch((err) => {
                console.error(`Failed to delete image ${publicId}:`, err.message);
                return null;
            })
        );
        await Promise.all(deletePromises);
    }

    await Variant.deleteMany({ product: product._id });
    await Review.deleteMany({ product: product._id });
    await product.deleteOne();

    return {
        message: "Product and all associated variants, images, and reviews deleted successfully",
    };
};

export {
    createProductService,
    updateProductService,
    deleteProductService
};