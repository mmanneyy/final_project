import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Generic validation middleware factory.
 * Accepts a `validator` which can be:
 * - a function that throws on invalid input
 * - a function that returns a Promise and rejects on invalid input
 * - a function that returns an object like { error } (Joi-style)
 * If no validator is provided, the middleware is a no-op.
 */
const validate = (validator) => async (req, res, next) => {
  if (!validator) return next();

  try {
    const result = validator(req);

    // Promise-style async validator
    if (result && typeof result.then === 'function') {
      await result;
      return next();
    }

    // Joi-like validator that returns { error }
    if (result && result.error) {
      const message = result.error.message || 'Validation failed';
      const details = result.error.details || [];
      throw new AppError(message, 'VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details });
    }

    // Synchronous validator that returns nothing (or throws)
    return next();
  } catch (err) {
    // Normalize the error to AppError if it's not already
    if (err && err.isOperational) return next(err);
    const message = err && err.message ? err.message : 'Validation failed';
    const details = err && err.details ? err.details : [];
    return next(new AppError(message, 'VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details }));
  }
};

export default validate;
