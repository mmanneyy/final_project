import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../success/successResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const register = async (req, res) => {
  const user = await authService.registerUser(req.body);
  sendSuccess(res, { id: user._id, email: user.email }, HTTP_STATUS.CREATED);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const {user, accessToken, refreshToken} = await authService.loginUser(email, password);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, cookieOptions);
  
  sendSuccess(res, { 
    user: { id: user._id, email: user.email },
    accessToken,
    refreshToken
  });
};

export const getMe = async (req, res) => {
  const user = await authService.getUserById(req.user.id); 
  sendSuccess(res, user);
};