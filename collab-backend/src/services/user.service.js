import User from '../models/user.model.js';
import AppError from '../errors/AppError.js';

export const getAllUsers = async () => {
  return await User.find().select('-password'); 
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId, 
    { $set: updateData }, 
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const makeUserAdmin = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId, 
    { role: 'admin' }, 
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) throw new AppError('User not found', 404);
  return user;
};