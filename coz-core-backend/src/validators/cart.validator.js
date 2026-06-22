import Joi from "joi";

const cartItemValidator = (obj) => {
    const schema = Joi.object({
        variantId: Joi.string().required(),
        size: Joi.string().required(),
        quantity: Joi.number().integer().min(1).default(1).optional(),
        note: Joi.string().max(500).optional()
    });
    return schema.validate(obj);
}

export {
    cartItemValidator
}