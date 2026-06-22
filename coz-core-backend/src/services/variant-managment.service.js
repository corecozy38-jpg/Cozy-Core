import Product from "../models/product.model.js";
import Variant from "../models/variant.model.js";
import { translateEnToAr, translateArrayEnToAr } from "../utils/geminiTranslation.util.js";
import { v2 as cloudinary } from "cloudinary";

const addVariantService = async (productId, variantData) => {
    const product = await Product.findById(productId);
    if (!product)
        throw new Error("Product not found");

    const colorName_ar = await translateEnToAr(variantData.colorName);
    const variant = new Variant({
        product: productId,
        colorName: variantData.colorName,
        colorName_ar,
        colorCode: variantData.colorCode || null,
        images: variantData.images,
        sizes: variantData.sizes
    });
    await variant.save();
    return variant;
};



const updateVariantService = async (variantId, updateData) => {
    const variant = await Variant.findById(variantId);
    if (!variant) 
        throw new Error("Variant not found");

    if (updateData.images !== undefined) {
        const oldPublicIds = variant.images.map(img => img.publicId).filter(id => id);
        const newPublicIds = updateData.images.map(img => img.publicId).filter(id => id);
        const toDelete = oldPublicIds.filter(id => !newPublicIds.includes(id));

        for (const publicId of toDelete) {
            try {
                await cloudinary.uploader.destroy(publicId);
                console.log(`Deleted old image: ${publicId}`);
            } catch (err) {
                console.error(`Failed to delete image ${publicId}:`, err.message);
            }
        }
        variant.images = updateData.images;
    }

    if (updateData.colorName !== undefined && updateData.colorName !== variant.colorName) {
        variant.colorName = updateData.colorName;
        variant.colorName_ar = await translateEnToAr(updateData.colorName);
    }
    variant.colorCode= updateData.colorCode || variant.colorCode;
    variant.sizes= updateData.sizes || variant.sizes;

    await variant.save();
    return variant;
};

const deleteVariantService = async (variantId) => {
    const variant = await Variant.findById(variantId);
    if (!variant)
        throw new Error("Variant not found");

    if (variant.images && variant.images.length) {
        for (const img of variant.images) {
            if (img.publicId) {
                try {
                    await cloudinary.uploader.destroy(img.publicId);
                    console.log(`Deleted image with publicId: ${img.publicId}`);
                } catch (err) {
                    console.error(`Failed to delete image ${img.publicId}:`, err.message);
                }
            }
        }
    }

    await variant.deleteOne();
    return { message: "Variant deleted successfully" };
};

const updateVariantSizeStockService = async (variantId, sizeName, { stock, sku }) => {
    const variant = await Variant.findById(variantId);
    if (!variant)
        throw new Error("Variant not found");

    const sizeIndex = variant.sizes.findIndex(s => s.size === sizeName);
    if (sizeIndex === -1)
        throw new Error("Size not found in this variant");

    if (stock !== undefined) variant.sizes[sizeIndex].stock = stock;
    if (sku !== undefined) variant.sizes[sizeIndex].sku = sku;

    await variant.save();
    return variant;
};


export {
    addVariantService,
    updateVariantService,
    deleteVariantService,
    updateVariantSizeStockService
}