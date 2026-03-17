import { HTTP_STATUS, ERROR_CONSTANTS } from "../constants/index.js";
import logger from "../config/logger.js";
import AppError from "../errors/AppError.js";

const isDev = process.env.NODE_ENV === "development";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize known errors
  if (err && err.name === "ValidationError") {
    // Mongoose validation error
    const details = {};
    Object.keys(err.errors || {}).forEach((k) => {
      details[k] = err.errors[k].message;
    });
    error = AppError.badRequest(
      err.message || "Validation failed",
      ERROR_CONSTANTS.VALIDATION.BAD_REQUEST.code,
      { details },
    );
  }

  if (err && (err.code === 11000 || err.name === "MongoServerError")) {
    // Duplicate key
    const key = err.keyValue || {};
    error = new AppError(
      err.message || "Duplicate key",
      ERROR_CONSTANTS.RESOURCE.CONFLICT.code,
      HTTP_STATUS.CONFLICT,
      { key },
    );
  }

  if (err && err.name === "CastError") {
    // Invalid ObjectId or cast
    error = AppError.badRequest(err.message || "Invalid identifier");
  }

  if (
    err &&
    (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
  ) {
    // JWT errors
    error = AppError.unauthorized(
      err.message || "Invalid token",
      ERROR_CONSTANTS.AUTH.INVALID_TOKEN.code,
    );
  }

  // Ensure we have an AppError
  if (!(error instanceof AppError)) {
    const message = isDev
      ? err && err.message
      : ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.message;
    error = AppError.internal(
      message,
      ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.code,
      { original: { message: err && err.message, name: err && err.name } },
    );
  }

  // Log everything
  logger.error(error.message, {
    code: error.code,
    statusCode: error.statusCode || error.status,
    path: req.originalUrl,
    method: req.method,
    isOperational: error.isOperational,
    userId: req.user?.id || null,
    metadata: error.metadata || {},
    stack: isDev ? err && err.stack : undefined,
  });

  // Minimal error response per acceptance criteria
  const payload = {
    success: false,
    error: {
      message: error.isOperational
        ? error.message
        : isDev
          ? error.message
          : ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.message,
      code: error.code || ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.code,
    },
  };

  return res
    .status(
      error.statusCode || error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    )
    .json(payload);
};

export default errorHandler;
