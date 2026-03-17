import * as userService from '../services/user.service.js';
import { sendSuccess } from '../success/successResponse.js';

export const listUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  sendSuccess(res, users);
};

export const getUser = async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  sendSuccess(res, user);
};

export const update = async (req, res) => {
  const updatedUser = await userService.updateUser(req.params.userId, req.body);
  sendSuccess(res, updatedUser);
};

export const makeAdmin = async (req, res) => {
  const updatedUser = await userService.makeUserAdmin(req.params.userId);
  sendSuccess(res, updatedUser);
};