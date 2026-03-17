import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(userController.listUsers));
router.get('/:userId', asyncHandler(userController.getUser));
router.patch('/:userId', asyncHandler(userController.update));

// Admin-only routes
router.patch('/:userId/make-admin', requireAdmin, asyncHandler(userController.makeAdmin));

export default router;