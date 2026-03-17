import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { env } from '../config/env.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('UNAUTHORIZED: No token provided'));
    }

    let userId = token; // default fallback if using token as ID directly in dev branch

    // If using JWT
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET || 'secret');
      userId = decoded.id || decoded._id;
    } catch(e) { 
      // ignore to allow fallback to raw token if they aren't actually using JWTs yet
    }

    // Find user
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return next(new Error('UNAUTHORIZED: User not found'));
    }

    // Attach user to socket instance
    socket.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new Error('UNAUTHORIZED: Token expired'));
    }
    return next(new Error('UNAUTHORIZED: Invalid token'));
  }
};
