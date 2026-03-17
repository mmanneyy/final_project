import { HTTP_STATUS, ERROR_CONSTANTS } from "../constants/index.js";

class AppError extends Error {
  constructor(
    message = ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.message,
    codeOrStatus,
    statusOrMeta,
    maybeMeta,
  ) {
    super(message);

    let code = ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.code;
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let metadata = {};

    // If second arg is a number -> treated as statusCode (old usage)
    if (typeof codeOrStatus === "number") {
      statusCode = codeOrStatus;
      metadata = statusOrMeta || {};
    } else if (typeof codeOrStatus === "string") {
      code = codeOrStatus;
      if (typeof statusOrMeta === "number") {
        statusCode = statusOrMeta;
        metadata = maybeMeta || {};
      } else {
        metadata = statusOrMeta || {};
      }
    } else {
      metadata = statusOrMeta || {};
    }

    this.message = message;
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

    /* Factory helpers */
    static badRequest(message = ERROR_CONSTANTS.VALIDATION.BAD_REQUEST.message, code = ERROR_CONSTANTS.VALIDATION.BAD_REQUEST.code, metadata = {}) {
      return new AppError(message, code, HTTP_STATUS.BAD_REQUEST, metadata);
    }

    static unauthorized(message = ERROR_CONSTANTS.AUTH.UNAUTHORIZED.message, code = ERROR_CONSTANTS.AUTH.UNAUTHORIZED.code, metadata = {}) {
      return new AppError(message, code, HTTP_STATUS.UNAUTHORIZED, metadata);
    }

    static forbidden(message = ERROR_CONSTANTS.AUTH.FORBIDDEN.message, code = ERROR_CONSTANTS.AUTH.FORBIDDEN.code, metadata = {}) {
      return new AppError(message, code, HTTP_STATUS.FORBIDDEN, metadata);
    }

    static notFound(message = ERROR_CONSTANTS.SERVER.NOT_FOUND.message, code = ERROR_CONSTANTS.SERVER.NOT_FOUND.code, metadata = {}) {
      return new AppError(message, code, HTTP_STATUS.NOT_FOUND, metadata);
    }

    static internal(message = ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.message, code = ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.code, metadata = {}) {
      return new AppError(message, code, HTTP_STATUS.INTERNAL_SERVER_ERROR, metadata);
    }
}

export default AppError;
