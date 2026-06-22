import Joi from 'joi';
import { productCategories, collectionTypes, ProductSizes } from '../utils/constants.util.js';


const imageSchema = Joi.object({
    url: Joi.string().uri().required(),
    publicId: Joi.string().required()
});

const sizeSchema = Joi.object({
    size: Joi.string().valid(...ProductSizes).required(),
    stock: Joi.number().integer().min(0).required(),
    sku: Joi.string().optional()
});

const variantSchema = Joi.object({
    colorName: Joi.string().required(),
    colorCode: Joi.string().optional().allow(null),
    images: Joi.array().items(imageSchema).min(1).required(),
    sizes: Joi.array().items(sizeSchema).min(1).required()
});

const sizeFitSchema = Joi.object({
    fitType: Joi.string().required(),
    modelHeight: Joi.number().optional(),
    wearingSize: Joi.string().optional()
});

const sizeGuidSchema = Joi.object({
    description: Joi.string().optional(),
    image: Joi.object({
        url: Joi.string().uri().optional(),
        publicId: Joi.string().optional()
    }).optional().allow(null)
});


export const createProductValidator = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        productType: Joi.string().valid(...productCategories).required(),
        collection: Joi.string().valid(...collectionTypes).required(),
        price: Joi.number().positive().required(),
        compareAtPrice: Joi.number().positive().optional().allow(null),
        features: Joi.array().items(Joi.string()).min(1).required(),

        sizeFit: sizeFitSchema.required(),

        sizeGuid: sizeGuidSchema.optional(),

        variants: Joi.array().items(variantSchema).min(1).required()
    });

    return schema.validate(data, { abortEarly: false });
};


export const updateProductValidator = (data) => {
    const schema = Joi.object({
        name: Joi.string().optional(),
        productType: Joi.string().valid(...productCategories).optional(),
        collection: Joi.string().valid(...collectionTypes).optional(),
        price: Joi.number().positive().optional(),
        compareAtPrice: Joi.number().positive().optional().allow(null),
        features: Joi.array().items(Joi.string()).optional(),
        sizeFit: Joi.object({
            fitType: Joi.string().optional(),
            modelHeight: Joi.number().optional(),
            wearingSize: Joi.string().optional()
        }).optional(),
        sizeGuid: Joi.object({
            description: Joi.string().optional(),
            image: Joi.object({
                url: Joi.string().uri().optional(),
                publicId: Joi.string().optional()
            }).optional()
        }).optional(),
        variants: Joi.array().items(Joi.object({
            colorName: Joi.string().optional(),
            colorCode: Joi.string().optional().allow(null),
            images: Joi.array().items(Joi.object({
                url: Joi.string().uri().required(),
                publicId: Joi.string().required()
            })).optional(),
            sizes: Joi.array().items(Joi.object({
                size: Joi.string().valid(...ProductSizes).required(),
                stock: Joi.number().integer().min(0).required(),
                sku: Joi.string().optional()
            })).optional()
        })).optional()
    }).min(1);
    
    return schema.validate(data, { abortEarly: false});
};