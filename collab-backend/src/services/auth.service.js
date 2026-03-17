import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({
    $or: [{ email: userData.email }, { username: userData.username }] 
  }).select("+passwordHash");
  if (existingUser) throw new AppError("User already exists", 400);

  const salt = await bcrypt.genSalt(env.SALT_ROUNDS);
  userData.passwordHash = await bcrypt.hash(userData.password, salt);

  return await User.create(userData);
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({email}).select("+passwordHash");
  if (!user || user.status === "disabled") throw new AppError("Invalid credentials", 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if(!match) throw new AppError("Invalid login credentials", 401);

  const accessToken = jwt.sign(
    {id: user._id},
    env.JWT.ACCESS_SECRET,
    {expiresIn: env.JWT.ACCESS_EXPIRES}
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    env.JWT.REFRESH_SECRET,
    { expiresIn: env.JWT.REFRESH_EXPIRES }
  );
  return {user, accessToken, refreshToken};
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};