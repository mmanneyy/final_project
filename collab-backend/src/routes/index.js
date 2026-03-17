import { Router } from 'express';
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js';
import roomRoutes from './room.routes.js';
import messageRoutes from './message.routes.js';

const router = Router();

router.use('/messages', messageRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);

export default router;
