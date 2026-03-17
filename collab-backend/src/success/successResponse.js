import { HTTP_STATUS } from "../constants/index.js";

const sendSuccess = (res, data = {}, status = HTTP_STATUS.OK) => {
    return res.status(status).json({
        success: true,
        data,
    });
};

export { sendSuccess };
