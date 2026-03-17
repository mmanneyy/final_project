import Room from '../models/room.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';

export const getUserRooms = async (userId) => {
  return await Room.find({ 
    'members.userId': userId,
    'members.leftAt': { $exists: false }
  })
  .populate('members.userId', 'username email')
  .sort({ lastMessageAt: -1, createdAt: -1 });
};

export const getAllRooms = async () => {
  return await Room.find({ 
    type: 'group' 
  })
  .populate('members.userId', 'username email')
  .sort({ lastMessageAt: -1, createdAt: -1 });
};

export const getRoomById = async (roomId, userId) => {
  const room = await Room.findById(roomId)
    .populate('members.userId', 'username email');
  
  if (!room) throw new AppError('Room not found', 404);
  
  const isMember = room.members.some(member => 
    member.userId.toString() === userId.toString() && !member.leftAt
  );
  
  if (!isMember) throw new AppError('Access denied', 403);
  
  return room;
};

export const createRoom = async (roomData, creatorId) => {
  const { name, type = 'group', memberIds = [] } = roomData;
  
  if (type === 'dm' && memberIds.length !== 1) {
    throw new AppError('DM rooms must have exactly one other member', 400);
  }
  
  // For group rooms, allow empty memberIds (admin can create empty room)
  if (type === 'group' && memberIds.length === 0) {
    // Admin can create empty group room, will add members later
  } else if (type === 'group' && memberIds.length < 1) {
    // This case won't happen with current logic, but keeping for clarity
  }
  
  // Check if all users exist (only if memberIds provided)
  if (memberIds.length > 0) {
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      throw new AppError('One or more users not found', 400);
    }
  }
  
  // For DM rooms, check if one already exists
  if (type === 'dm') {
    const sortedIds = [creatorId, memberIds[0]].sort();
    const dmKey = `${sortedIds[0]}_${sortedIds[1]}`;
    
    const existingDm = await Room.findOne({ dmKey, type: 'dm' });
    if (existingDm) {
      return existingDm;
    }
  }
  
  const members = [
    { userId: creatorId, joinedAt: new Date() },
    ...memberIds.map(id => ({ userId: id, joinedAt: new Date() }))
  ];
  
  const roomDataToCreate = {
    type,
    members,
    ...(type === 'dm' && { 
      dmKey: [creatorId, memberIds[0]].sort().join('_') 
    }),
    ...(name && { name })
  };
  
  return await Room.create(roomDataToCreate);
};

export const addMemberToRoom = async (roomId, userId, requesterId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new AppError('Room not found', 404);
  
  // Check if requester is a member
  const isRequesterMember = room.members.some(member => 
    member.userId.toString() === requesterId.toString() && !member.leftAt
  );
  if (!isRequesterMember) throw new AppError('Access denied', 403);
  
  // Check if user to add exists
  const userToAdd = await User.findById(userId);
  if (!userToAdd) throw new AppError('User not found', 400);
  
  // Check if user is already a member
  const isAlreadyMember = room.members.some(member => 
    member.userId.toString() === userId.toString() && !member.leftAt
  );
  if (isAlreadyMember) throw new AppError('User is already a member', 400);
  
  // Add member
  room.members.push({ userId, joinedAt: new Date() });
  await room.save();
  
  return room;
};

export const joinRoom = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new AppError('Room not found', 404);
  
  // Check if user is already a member
  const isMember = room.members.some(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (isMember) {
    // If user left before, remove leftAt to rejoin
    const memberIndex = room.members.findIndex(member => 
      member.userId.toString() === userId.toString()
    );
    if (room.members[memberIndex].leftAt) {
      room.members[memberIndex].leftAt = undefined;
      await room.save();
    }
  } else {
    // Add new member
    room.members.push({ userId, joinedAt: new Date() });
    await room.save();
  }
  
  return room;
};

export const leaveRoom = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new AppError('Room not found', 404);
  
  const memberIndex = room.members.findIndex(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (memberIndex === -1) {
    throw new AppError('User is not a member of this room', 400);
  }
  
  room.members[memberIndex].leftAt = new Date();
  await room.save();
  
  return room;
};

export const getRoomMembers = async (roomId, userId) => {
  const room = await Room.findById(roomId).populate('members.userId', 'username email');
  if (!room) throw new AppError('Room not found', 404);
  
  const isMember = room.members.some(member => 
    member.userId.toString() === userId.toString() && !member.leftAt
  );
  if (!isMember) throw new AppError('Access denied', 403);
  
  return room.members.filter(member => !member.leftAt);
};