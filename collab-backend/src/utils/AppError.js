import { HTTP_STATUS, ERROR_CONSTANTS } from "../constants/index.js";

class AppError extends Error {
    constructor(
      message = ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.message,
      code = ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.code,
      status = HTTP_STATUS.INTERNAL_SERVER_ERROR,
      metadata = {}
      ) {
        super(message);
        this.code = code;
        this.status = status;
        this.metadata = metadata;
        this.isOperational = true; 
        Error.captureStackTrace(this, this.constructor);
      }
}

export default AppError;