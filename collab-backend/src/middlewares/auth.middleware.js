import { env } from '../config/env.js';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';
import AppError from '../errors/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Authentication middleware
 * - Expects header: Authorization: Bearer <token>
 * - In this lightweight implementation the token is treated as a userId.
 * - If you use JWTs in your project, replace the token verification logic
 *   with jwt.verify(...) and extract the user id from the token payload.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies.accessToken;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new AppError('Authentication required. No token found.', 'AUTH_REQUIRED', 401);
    }

    const decoded = jwt.verify(token, env.JWT.ACCESS_SECRET);

    const user = await authService.getUserById(decoded.id);
    if (!user) {
      throw new AppError('User no longer exists', 'USER_NOT_FOUND', 401);
    }

    req.user = { id: user._id.toString(), email: user.email };
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Invalid or expired token', 'INVALID_TOKEN', 401));
  }
};

