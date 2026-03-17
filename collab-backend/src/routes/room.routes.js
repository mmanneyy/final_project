import { Router } from 'express';
import * as roomController from '../controllers/room.controller.js';
import messageRoutes from './message.routes.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(roomController.listRooms));
router.post('/', requireAdmin, asyncHandler(roomController.create)); // Only admins can create rooms
router.get('/:roomId', asyncHandler(roomController.getRoom));
router.post('/:roomId/members', asyncHandler(roomController.addMember));
router.get('/:roomId/members', asyncHandler(roomController.getMembers));
router.post('/:roomId/join', asyncHandler(roomController.join));
router.post('/:roomId/leave', asyncHandler(roomController.leave));

router.use('/:roomId/messages', messageRoutes);

export default router;