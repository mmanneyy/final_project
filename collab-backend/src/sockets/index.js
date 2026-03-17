import { Server } from 'socket.io';
import { socketAuthMiddleware } from './middleware.js';
import { registerSocketHandlers } from './handlers.js';
import User from '../models/user.model.js';
import Room from '../models/room.model.js';

export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // We can change this to specific domain in production
      methods: ['GET', 'POST']
    }
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id} (User: ${socket.user.username})`);

    // Mark user as online upon initial connection
    const broadcastUserStatus = async (isOnline) => {
      try {
        const rooms = await Room.find({ "members.userId": socket.user._id });
        const roomIds = rooms.map(r => r._id.toString());
        
        await User.findByIdAndUpdate(
          socket.user._id,
          { isOnline, lastSeen: Date.now() },
        );

        roomIds.forEach(roomId => {
          socket.to(roomId).emit(isOnline ? 'user:online' : 'user:offline', {
            userId: socket.user._id,
            username: socket.user.username
          });
        });
      } catch (error) {
        console.error('Initial user status error:', error);
      }
    };
    broadcastUserStatus(true);

    registerSocketHandlers(io, socket);
  });

  return io;
};
