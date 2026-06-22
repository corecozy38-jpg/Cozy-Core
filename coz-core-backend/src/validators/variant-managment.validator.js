import Joi from "joi"
const updateVariantSizeStockValidator = (data) => {
    const schema = Joi.object({
        stock: Joi.number().integer().min(0).optional(),
        sku: Joi.string().optional()
    }).min(1);
    return schema.validate(data, { abortEarly: false });
};


export {
    updateVariantSizeStockValidator
}