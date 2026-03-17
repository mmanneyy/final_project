import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
