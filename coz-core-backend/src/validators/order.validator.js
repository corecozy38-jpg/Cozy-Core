import Joi from 'joi';
import { phoneRegex } from '../utils/constants.util.js';

const createOrderValidator = (data) => {
    const schema = Joi.object({
        shippingAddress: Joi.object({
            fullName: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.string().pattern(phoneRegex).required()
                .messages({ 'string.pattern.base': 'Phone number must be a valid Egyptian number' }),
            street: Joi.string().required(),
            city: Joi.string().required(),
            governorate: Joi.string().required(),
            country: Joi.string().default('Egypt').optional(),
            postalCode: Joi.string().allow(null, '').optional(),
            apartment: Joi.string().allow(null, '').optional()
        }).required(),
        notes: Joi.string().max(1000).optional().allow('')
    });
    return schema.validate(data);
};

export { createOrderValidator };