import Redis from "ioredis";
import logger from "./logger.js";
import { env } from "./env.js";

const redis = new Redis({
  host: env.REDIS.HOST,     
  port: env.REDIS.PORT,
  password: env.REDIS.PASSWORD || undefined, 
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  logger.info("Redis Client Connected successfully");
});

redis.on("error", (err) => {
  logger.error("Redis Client Error:", err);
});

export default redis;