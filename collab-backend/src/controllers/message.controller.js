import * as messageService from '../services/message.service.js';
import { sendSuccess } from '../success/successResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const listMessages = async (req, res) => {
  const { before, limit } = req.query;
  const messages = await messageService.getRoomMessages(req.params.roomId, req.user.id, before, limit);
  sendSuccess(res, messages);
};

export const create = async (req, res) => {
  const message = await messageService.createMessage(
    req.params.roomId, 
    req.user.id, 
    req.body.content
  );
  sendSuccess(res, message, HTTP_STATUS.CREATED);
};

export const update = async (req, res) => {
  const message = await messageService.updateMessage(
    req.params.messageId, 
    req.params.roomId, 
    req.body.content
  );
  sendSuccess(res, message);
};

export const remove = async (req, res) => {
  await messageService.deleteMessage(req.params.messageId, req.user.id);
  res.status(HTTP_STATUS.NO_CONTENT).send();
};