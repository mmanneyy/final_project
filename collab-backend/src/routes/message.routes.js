import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware); 

router.get('/', asyncHandler(messageController.listMessages));
router.post('/', asyncHandler(messageController.create));
router.patch('/:messageId', asyncHandler(messageController.update));
router.delete('/:messageId', asyncHandler(messageController.remove));

export default router;