import { Server } from 'socket.io';

/**
 * Initialize socket.io server
 * @param {http.Server} httpServer - an HTTP server instance (returned from app.listen)
 * @param {object} opts - optional socket.io server options
 * @returns {Server} io - socket.io server instance
 */
const initSocket = (httpServer, opts = {}) => {
  if (!httpServer) {
    throw new Error('initSocket requires an http.Server instance');
  }

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    ...opts,
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinRoom', ({ roomId } = {}) => {
      if (!roomId) return socket.emit('error', { message: 'roomId is required to join a room' });
      socket.join(roomId);
    });

    socket.on('leaveRoom', ({ roomId } = {}) => {
      if (!roomId) return socket.emit('error', { message: 'roomId is required to leave a room' });
      socket.leave(roomId);
    });

    socket.on('message', (payload = {}) => {
      const { roomId, ...rest } = payload;
      if (!roomId) return socket.emit('error', { message: 'roomId is required to send a message' });
      io.to(roomId).emit('message', { roomId, ...rest });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, reason);
    });
  });

  return io;
};

export default initSocket;

export const emitToRoom = (io, room, event, data) => {
  if (!io || !room || !event) return;
  io.to(room).emit(event, data);
};
