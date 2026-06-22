import joi from "joi";
import passwordComplexity from "joi-password-complexity";

export const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,  
};

export const passwordSchema = passwordComplexity(complexityOptions).messages({
    'passwordComplexity.tooShort': 'Password must be at least 8 characters',
    'passwordComplexity.tooLong': 'Password must not exceed 30 characters',
    'passwordComplexity.lowercase': 'Password must contain at least one lowercase letter',
    'passwordComplexity.uppercase': 'Password must contain at least one uppercase letter',
    'passwordComplexity.numeric': 'Password must contain at least one number',
    'passwordComplexity.symbol': 'Password must contain at least one special character (!@#$%^&*)',
});

const registerValidator = (obj) => {
    const schema = joi.object({
        fullName: joi.string().required(),
        email: joi.string().email().required(),
        password: passwordSchema.required(),
        confirmPassword: joi.string().valid(joi.ref("password")).required(),
        phone: joi.string().required(),
        address: joi
            .array()
            .items(
                joi.object({
                    country: joi.string().default('Egypt').optional(),
                    governorate: joi.string().required(),
                    city: joi.string().required(),
                    street: joi.string().required(),
                    apartment: joi.string().allow(null),
                    postalCode: joi.string().allow(null),
                }),
            )
            .min(1)
            .required(),
    });
    return schema.validate(obj);
}

const loginValidator = (obj) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: passwordSchema.required(),
    });
    return schema.validate(obj);
}

const changePasswordValidator = (obj) => {
    const schema = joi.object({
        currentPassword: joi.string().required(),
        newPassword: passwordSchema.required(),
        confirmNewPassword: joi.string().valid(joi.ref("newPassword")).required(),
    });
    return schema.validate(obj);
}




const forgotPasswordValidator = (obj) => {
    const schema = joi.object({
        email: joi.string().email().required(),
    });
    return schema.validate(obj);
};

const verifyOTPValidator = (obj) => {
    const schema = joi.object({
        token: joi.string().required(),
        otp: joi.string().length(6).pattern(/^[0-9]+$/).required(),
    });
    return schema.validate(obj);
};

const resetPasswordValidator = (obj) => {
    const schema = joi.object({
        token: joi.string().required(),
        password: passwordSchema,
        confirmPassword: joi.string().valid(joi.ref('password')).required(),
    });
    return schema.validate(obj);
};

export {
    registerValidator,
    loginValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    verifyOTPValidator,
    resetPasswordValidator
}