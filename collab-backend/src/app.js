import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import apiRouter from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import constants from './constants/index.js';

const { HTTP_STATUS, ERROR_CONSTANTS } = constants;

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());
// Main API Router
app.use('/api', apiRouter);

// 404 Handler
app.use((req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: ERROR_CONSTANTS.SERVER.NOT_FOUND?.code || 'NOT_FOUND',
      message: 'The requested resource was not found.'
    }
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
