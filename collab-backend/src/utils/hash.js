import bcrypt from "bcrypt";
import env from "../config/env.js";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, env.SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};