import Joi from 'joi';

const contactValidator = (data) => {
    const schema = Joi.object({
        phone: Joi.string().optional().allow(''),
        email: Joi.string().email().optional().allow(''),
        instagram: Joi.string().uri().optional().allow('')
    });
    return schema.validate(data);
};

const aboutValidator = (data) => {
    const schema = Joi.object({
        title: Joi.string().optional().allow(''),
        description: Joi.string().optional().allow(''),
    });
    return schema.validate(data);
};

const orderGuideValidator = (data) => {
    const schema = Joi.object({
        images: Joi.array().items(
            Joi.object({
                url: Joi.string().uri().required(),
                publicId: Joi.string().required(),
                displayOrder: Joi.number().integer().min(0).optional()
            })
        ).optional()
    });
    return schema.validate(data);
};



const termsValidator = (data) => {
    const schema = Joi.object({
        terms: Joi.array().items(
            Joi.object({
                title: Joi.string().optional().allow(''),
                content: Joi.string().optional().allow(''),
            })
        )
});
    return schema.validate(data);
};

export {
    contactValidator,
    aboutValidator,
    orderGuideValidator,
    termsValidator
};








