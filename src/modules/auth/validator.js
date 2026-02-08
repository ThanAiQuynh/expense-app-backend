import Joi from 'joi';
import { VALIDATION_MESSAGES } from './constants.js';

const emailField = Joi.string().email().required().messages({
  'string.email': VALIDATION_MESSAGES.EMAIL_INVALID,
  'any.required': VALIDATION_MESSAGES.EMAIL_REQUIRED,
});

const passwordField = Joi.string().min(6).required().messages({
  'string.min': VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
  'any.required': VALIDATION_MESSAGES.PASSWORD_REQUIRED,
});

const baseAuthSchema = {
  email: emailField,
  password: passwordField,
};

export const registerSchema = Joi.object({
  ...baseAuthSchema,
  fullName: Joi.string().required().messages({
    'any.required': VALIDATION_MESSAGES.FULLNAME_REQUIRED,
  }),
});

export const loginSchema = Joi.object({
  ...baseAuthSchema
});
