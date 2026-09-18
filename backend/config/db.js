import mongoose from 'mongoose';

/**
 * Reusable MongoDB Connection Module
 * Connects to MongoDB using Mongoose, prevents multiple redundant connections,
 * and handles connection error gracefully.
 */
export const connectDB = async () => {
  // If already connected or connecting, reuse existing connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/banking_ai';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not crash server in hackathon dev mode; allows inspection and graceful degradation
    return null;
  }
};

export default connectDB;
