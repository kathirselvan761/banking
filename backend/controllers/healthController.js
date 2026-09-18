import mongoose from 'mongoose';
import { aiClientService } from '../services/aiClientService.js';

/**
 * Health Check Controller
 * Endpoint: GET /api/health
 */
export const getHealth = async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  // Optionally check AI service status
  let aiStatus = 'unknown';
  try {
    const aiHealth = await aiClientService.checkHealth();
    aiStatus = aiHealth.status || 'unreachable';
  } catch {
    aiStatus = 'unreachable';
  }

  res.status(200).json({
    status: 'healthy',
    service: 'banking-ai-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    system: {
      mongodb: dbStatus,
      ai_microservice: aiStatus
    }
  });
};
