import Message from '../models/message.model.js';
import Room from '../models/room.model.js';
import AppError from '../utils/AppError.js';

export const getRoomMessages = async (roomId, userId, before, limit = 50) => {
  const room = await Room.findById(roomId);
  if (!room) throw new AppError('Room not found', 404);
  
  const isMember = room.members.some(member => 
    member.userId.toString() === userId.toString() && !member.leftAt
  );
  if (!isMember) throw new AppError('User is not a member of the room', 403);

  const query = { roomId };
  if (before) {
    query._id = { $lt: before };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('senderId', 'username email');

  // Return messages in chronological order (oldest first)
  return messages.reverse();
};

export const createMessage = async (roomId, senderId, content) => {
  // Validate content
  if (!content || content.trim().length === 0) {
    throw new AppError('Message content cannot be empty', 'EMPTY_MESSAGE', 400);
  }

  if (content.trim().length > 4000) {
    throw new AppError('Message content too long (max 4000 characters)', 'MESSAGE_TOO_LONG', 400);
  }

  // Verify room exists and user is a member
  const room = await Room.findById(roomId);
  if (!room) throw new AppError('Room not found', 404);
  
  const isMember = room.members.some(member => 
    member.userId.toString() === senderId.toString() && !member.leftAt
  );
  if (!isMember) throw new AppError('User is not a member of the room', 403);

  // Create message
  const message = await Message.create({ 
    roomId, 
    senderId, 
    content: content.trim() 
  });

  // Update room's lastMessageAt
  room.lastMessageAt = new Date();
  await room.save();

  // Populate sender info and return
  return await Message.findById(message._id)
    .populate('senderId', 'username email');
};

export const updateMessage = async (messageId, roomId, content) => {
  // Validate content
  if (!content || content.trim().length === 0) {
    throw new AppError('Message content cannot be empty', 'EMPTY_MESSAGE', 400);
  }

  if (content.trim().length > 4000) {
    throw new AppError('Message content too long (max 4000 characters)', 'MESSAGE_TOO_LONG', 400);
  }

  const message = await Message.findOneAndUpdate(
    { _id: messageId, roomId }, 
    { content: content.trim(), edited: true },
    { new: true }
  ).populate('senderId', 'username email');
  
  if (!message) throw new AppError('Message not found', 404);
  return message;
};

export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new AppError('Message not found', 404);
  
  if (message.senderId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to delete this message', 403);
  }

  await message.deleteOne();
  return true;
};