import Joi from 'joi';

export const writeNewReviewValidator = (data, isLoggedIn) => {
    let schema = Joi.object({
        content: Joi.string().required().min(5).max(1000),
        rating: Joi.number().required().min(1).max(5),
        images: Joi.array().items(
            Joi.object({
                url: Joi.string().uri().required(),
                publicId: Joi.string().required()
            })
        ).optional()
    });

    if (!isLoggedIn) {
        schema = schema.keys({
            guestName: Joi.string().required().min(2),
            guestEmail: Joi.string().email().required()
        });
    } else {
        schema = schema.keys({
            guestName: Joi.forbidden(),
            guestEmail: Joi.forbidden()
        });
    }

    return schema.validate(data, { abortEarly: false });
};