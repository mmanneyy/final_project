import { ERROR_CONSTANTS } from "../constants/index.js";

const sendSocketError = (socket, error, eventName = "error") => {
  const payload = {
    event: eventName,
    error: {
      message: error.isOperational
        ? error.message
        : ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.message,
      code: error.code || ERROR_CONSTANTS.SERVER.INTERNAL_ERROR.code,
      metadata: error.metadata || {},
    },
  };
  socket.emit(eventName, payload);
};

export { sendSocketError };