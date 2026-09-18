import axios from 'axios';
import { logger } from '../utils/logger.js';

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiApiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * AI Service Integration Wrapper
 * Communicates with FastAPI ML endpoints
 */
export const aiService = {
  /**
   * Predict future loan default risk using XGBoost model
   * @param {Object} features Customer & loan features
   * @returns {Promise<{default_probability: number, risk_score: number, risk_level: string}>}
   */
  predictDefaultRisk: async (features) => {
    try {
      const response = await aiApiClient.post('/predict/default-risk', features);
      return response.data;
    } catch (error) {
      logger.error(`Failed to invoke /predict/default-risk: ${error.message}`);
      throw new Error(
        error.response?.data?.detail || 'AI Service unavailable for default risk prediction'
      );
    }
  },

  /**
   * Detect transaction anomaly using Isolation Forest model
   * @param {Object} transaction Transaction attributes
   * @returns {Promise<{is_anomaly: boolean, anomaly_score: number}>}
   */
  detectTransactionAnomaly: async (transaction) => {
    try {
      const response = await aiApiClient.post('/detect/transaction-anomaly', transaction);
      return response.data;
    } catch (error) {
      logger.error(`Failed to invoke /detect/transaction-anomaly: ${error.message}`);
      throw new Error(
        error.response?.data?.detail || 'AI Service unavailable for transaction anomaly detection'
      );
    }
  },

  /**
   * Check AI microservice health
   */
  checkHealth: async () => {
    try {
      const response = await aiApiClient.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'unreachable', error: error.message };
    }
  }
};

export const { predictDefaultRisk, detectTransactionAnomaly } = aiService;
