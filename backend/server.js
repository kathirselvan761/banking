import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import { connectDB } from './utils/db.js';
import { logger } from './utils/logger.js';
import healthRoutes from './routes/healthRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Attempt Non-blocking Database Connection
connectDB();

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/simulate', simulationRoutes);
app.use('/api/events', eventRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'AI-Powered Early Warning & Decision Intelligence System - Backend API',
    healthCheck: '/api/health',
    status: 'operational'
  });
});

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start HTTP Server
const server = app.listen(PORT, () => {
  logger.info(`Banking AI Backend Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
  logger.info(`Health check endpoint accessible at http://localhost:${PORT}/api/health`);
});

export default server;
