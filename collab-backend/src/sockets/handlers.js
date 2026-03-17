import Room from '../models/room.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

export const registerSocketHandlers = (io, socket) => {
  const user = socket.user;

  // Helper to emit error
  const emitError = (message, code) => {
    socket.emit('error', { message, code });
  };

  const isMember = (room) => {
    return room.members.some(member => member.userId.toString() === user._id.toString());
  };

  socket.on('room:join', async ({ roomId }) => {
    try {
      if (!roomId) return emitError('Room ID required', 'VALIDATION_ERROR');

      const room = await Room.findById(roomId);
      if (!room) return emitError('Room not found', 'ROOM_NOT_FOUND');

      if (!isMember(room)) {
        return emitError('User is not a member of the room', 'NOT_A_MEMBER');
      }

      socket.join(roomId);
      socket.to(roomId).emit('room:user-joined', {
        userId: user._id,
        username: user.username,
        roomId
      });
    } catch (error) {
      console.error('room:join error:', error);
      emitError('Internal server error', 'SERVER_ERROR');
    }
  });

  socket.on('room:leave', ({ roomId }) => {
    try {
      if (!roomId) return emitError('Room ID required', 'VALIDATION_ERROR');

      socket.leave(roomId);
      socket.to(roomId).emit('room:user-left', {
        userId: user._id,
        username: user.username,
        roomId
      });
    } catch (error) {
      console.error('room:leave error:', error);
      emitError('Internal server error', 'SERVER_ERROR');
    }
  });

  socket.on('message:send', async ({ roomId, content }) => {
    try {
      if (!roomId || !content) {
        return emitError('Room ID and content are required', 'VALIDATION_ERROR');
      }

      if (content.trim().length === 0 || content.length > 2000) {
        return emitError('Message content must be between 1 and 2000 characters', 'VALIDATION_ERROR');
      }

      const room = await Room.findById(roomId);
      if (!room) return emitError('Room not found', 'ROOM_NOT_FOUND');

      if (!isMember(room)) {
        return emitError('User is not a member of the room', 'NOT_A_MEMBER');
      }

      const message = new Message({
        roomId: roomId,
        senderId: user._id,
        content: content.trim()
      });

      await message.save();

      // Populate sender before broadcasting - message.model.js uses senderId
      await message.populate('senderId', '_id username avatar');

      io.to(roomId).emit('message:new', {
        _id: message._id,
        content: message.content,
        sender: {
          _id: message.senderId._id,
          username: message.senderId.username,
          avatar: message.senderId.avatar // Optional field on UI if they added it
        },
        room: message.roomId,
        createdAt: message.createdAt
      });
    } catch (error) {
      console.error('message:send error:', error);
      emitError('Internal server error', 'SERVER_ERROR');
    }
  });

  socket.on('typing:start', ({ roomId }) => {
    if (roomId) socket.to(roomId).emit('typing:start', { userId: user._id, roomId });
  });

  socket.on('typing:stop', ({ roomId }) => {
    if (roomId) socket.to(roomId).emit('typing:stop', { userId: user._id, roomId });
  });

  const broadcastUserStatus = async (isOnline) => {
    try {
      // Find all rooms the user is a member of
      const rooms = await Room.find({ "members.userId": user._id });
      const roomIds = rooms.map(r => r._id.toString());
      
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { isOnline, lastSeen: Date.now() },
        { new: true }
      );

      // Broadcast to all these rooms
      roomIds.forEach(roomId => {
        io.to(roomId).emit(isOnline ? 'user:online' : 'user:offline', {
          userId: user._id,
          username: user.username,
          lastSeen: updatedUser.lastSeen
        });
      });
    } catch (error) {
      console.error('user status update error:', error);
    }
  };

  socket.on('user:online', async () => {
    await broadcastUserStatus(true);
  });

  socket.on('user:offline', async () => {
    await broadcastUserStatus(false);
  });

  socket.on('disconnect', async () => {
    console.log(`Socket disconnected: ${socket.id} (User: ${user.username})`);
    
    // Disconnect happens automatically for all socket rooms, but we might want to let others know
    await broadcastUserStatus(false);
  });
};
