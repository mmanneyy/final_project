import app from './app.js';
import connectDB from './config/db.js';
import redis from './config/redis.js';
import { env } from './config/env.js';
import logger from './config/logger.js';
import http from 'http';
import { initSocketServer } from './sockets/index.js';

const startServer = async () => {
  try {
    await connectDB();
    
    logger.info('Redis status: OK');

    const server = http.createServer(app);
    initSocketServer(server);

    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();