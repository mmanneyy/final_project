import * as roomService from '../services/room.service.js';
import { sendSuccess } from '../success/successResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const listRooms = async (req, res) => {
  const rooms = await roomService.getUserRooms(req.user.id);
  sendSuccess(res, rooms);
};

export const create = async (req, res) => {
  const room = await roomService.createRoom(req.body, req.user.id);
  sendSuccess(res, room, HTTP_STATUS.CREATED);
};

export const getRoom = async (req, res) => {
  const room = await roomService.getRoomById(req.params.roomId, req.user.id);
  sendSuccess(res, room);
};

export const addMember = async (req, res) => {
  const { userId } = req.body;
  const room = await roomService.addMemberToRoom(req.params.roomId, userId, req.user.id);
  sendSuccess(res, room);
};

export const getMembers = async (req, res) => {
  const members = await roomService.getRoomMembers(req.params.roomId, req.user.id);
  sendSuccess(res, members);
};

export const join = async (req, res) => {
  await roomService.joinRoom(req.params.roomId, req.user.id);
  sendSuccess(res, { message: "Successfully joined the room" });
};

export const leave = async (req, res) => {
  await roomService.leaveRoom(req.params.roomId, req.user.id);
  sendSuccess(res, { message: "Successfully left the room" });
};