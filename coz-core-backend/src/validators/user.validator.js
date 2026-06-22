import Joi from 'joi';
import { phoneRegex } from '../utils/constants.util.js';
const updateUserValidator = (body) => {
    const schema = Joi.object({
            fullName: Joi.string().optional(),
            phone: Joi.string().optional().pattern(phoneRegex).
            messages({ 'string.pattern.base': 'Phone number must be a valid Egyptian number' }),
    }).min(1).required();
    return schema.validate(body);
}


const addressSchema = Joi.object({
    governorate: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    apartment: Joi.string().allow(null, '').optional(),
    postalCode: Joi.string().allow(null, '').optional(),
    country: Joi.string().default('Egypt').optional()
});

const addAddressesValidator = (body) => {
    const schema = Joi.object({
        addresses: Joi.array().items(addressSchema).min(1).max(5).required()
            .messages({
                'array.min': 'At least one address is required',
                'array.max': 'You can add up to 5 addresses at once'
            })
    });
    return schema.validate(body);
};


const updateAddressValidator = (body) => {
    const schema = Joi.object({
        governorate: Joi.string().optional(),
        city: Joi.string().optional(),
        street: Joi.string().optional(),
        apartment: Joi.string().allow(null).optional(),
        postalCode: Joi.string().allow(null).optional(),
        country: Joi.string().optional()
    }).min(1); 
    return schema.validate(body);
};

export {
    updateUserValidator,
    addAddressesValidator,
    updateAddressValidator
}