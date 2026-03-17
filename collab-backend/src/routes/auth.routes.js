import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', authMiddleware, asyncHandler(authController.getMe));

export default router;