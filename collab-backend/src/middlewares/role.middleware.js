import AppError from '../utils/AppError.js';

/**
 * Middleware to check if user has admin role
 * Must be used after authMiddleware
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // req.user should be set by authMiddleware
    if (!req.user) {
      throw new AppError('Authentication required', 'AUTH_REQUIRED', 401);
    }

    // We need to get the user with role from database
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(req.user.id).select('role');
    
    if (!user) {
      throw new AppError('User not found', 'USER_NOT_FOUND', 404);
    }

    if (user.role !== 'admin') {
      throw new AppError('Admin access required', 'ADMIN_REQUIRED', 403);
    }

    // Add role to request object for potential use in controllers
    req.user.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has specific role
 * @param {string} role - Required role ('user' | 'admin')
 */
export const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'AUTH_REQUIRED', 401);
      }

      const User = (await import('../models/user.model.js')).default;
      const user = await User.findById(req.user.id).select('role');
      
      if (!user) {
        throw new AppError('User not found', 'USER_NOT_FOUND', 404);
      }

      if (user.role !== role) {
        throw new AppError(`${role} access required`, `${role.toUpperCase()}_REQUIRED`, 403);
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
