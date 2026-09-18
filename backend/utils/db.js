import mongoose from 'mongoose';
import { logger } from './logger.js';

/**
 * Connect to MongoDB database instance
 * Non-blocking: If MongoDB is offline, it logs a clear warning without crashing the server.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/banking_early_warning';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // Quick timeout for hackathon ease
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    logger.warn(`MongoDB Connection Notice: ${error.message}`);
    logger.warn(`Running backend in independent mode. Health checks and AI proxy will continue to work.`);
    return false;
  }
};
