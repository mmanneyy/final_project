import dotenv from 'dotenv';
dotenv.config();

const requiredVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`FATAL ERROR: Environment variable ${key} is missing.`);
  }
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  MONGO_URI: process.env.MONGO_URI,
  
  REDIS: {
    HOST: process.env.REDIS_HOST || '127.0.0.1',
    PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    PASSWORD: process.env.REDIS_PASSWORD || null,
  },
  
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};