import Joi from 'joi';
import { VALIDATION_MESSAGES } from './constants.js';

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': VALIDATION_MESSAGES.EMAIL_INVALID,
        'any.required': VALIDATION_MESSAGES.EMAIL_REQUIRED,
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
        'any.required': VALIDATION_MESSAGES.PASSWORD_REQUIRED
    }),
    fullName: Joi.string().required().messages({
        'any.required': VALIDATION_MESSAGES.FULLNAME_REQUIRED
    })
});