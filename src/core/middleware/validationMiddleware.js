import AppError from '../utils/appError.js';

/**
 * Generic validation middleware
 * @param {Joi.Schema} schema 
 * @param {string} source - 'body', 'query', or 'params'
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true // Remove keys that are not defined in the schema
        });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');
            return next(new AppError(errorMessage, 400));
        }

        // Replace req[source] with validated and potentially transformed values
        req[source] = value;
        next();
    };
};

export default validate;
