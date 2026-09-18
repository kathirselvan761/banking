import axios from 'axios';
import { logger } from '../utils/logger.js';

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiApiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Service to interact with the FastAPI AI Microservice
 */
export const aiClientService = {
  /**
   * Check AI microservice health
   */
  checkHealth: async () => {
    try {
      const response = await aiApiClient.get('/health');
      return response.data;
    } catch (error) {
      logger.error(`AI Microservice unreachable at ${AI_BASE_URL}: ${error.message}`);
      return { status: 'unreachable', error: error.message };
    }
  },

  /**
   * Request multi-agent early warning risk evaluation
   */
  evaluateRisk: async (customerId, payload = {}) => {
    try {
      const response = await aiApiClient.post('/api/v1/agents/evaluate', {
        customer_id: customerId,
        ...payload
      });
      return response.data;
    } catch (error) {
      logger.error(`Error invoking AI agent evaluation: ${error.message}`);
      throw error;
    }
  }
};
