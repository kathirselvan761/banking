import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../utils/logger.js';

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiApiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 30000, // 30s timeout for ML / Whisper STT models
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * AI Service Integration Wrapper
 * Communicates with FastAPI ML, NLP, SBERT, and Voice endpoints
 */
export const aiService = {
  /**
   * Predict future loan default risk using XGBoost + SHAP explainability
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
   * Analyze text sentiment via FinBERT
   */
  analyzeSentiment: async (text) => {
    try {
      const response = await aiApiClient.post('/analyze/sentiment', { text });
      return response.data;
    } catch (error) {
      logger.error(`Failed to invoke /analyze/sentiment: ${error.message}`);
      throw new Error(
        error.response?.data?.detail || 'AI Service unavailable for sentiment analysis'
      );
    }
  },

  /**
   * Analyze complaint grievance text (category, sentiment, severity, keywords)
   */
  analyzeComplaint: async (text) => {
    try {
      const response = await aiApiClient.post('/analyze/complaint', { text });
      return response.data;
    } catch (error) {
      logger.error(`Failed to invoke /analyze/complaint: ${error.message}`);
      throw new Error(
        error.response?.data?.detail || 'AI Service unavailable for complaint analysis'
      );
    }
  },

  /**
   * Detect recurring customer grievances using Sentence-BERT semantic similarity
   */
  detectRecurringIssue: async (currentComplaint, previousComplaints = []) => {
    try {
      const response = await aiApiClient.post('/detect/recurring-issue', {
        current_complaint: currentComplaint,
        previous_complaints: previousComplaints
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to invoke /detect/recurring-issue: ${error.message}`);
      throw new Error(
        error.response?.data?.detail || 'AI Service unavailable for recurring issue detection'
      );
    }
  },

  /**
   * Transcribe audio and process through complaint NLP
   */
  analyzeVoice: async (fileBuffer, filename) => {
    try {
      const form = new FormData();
      form.append('file', fileBuffer, { filename: filename || 'audio.wav' });

      const response = await axios.post(`${AI_BASE_URL}/analyze/voice`, form, {
        headers: {
          ...form.getHeaders()
        },
        timeout: 45000
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to invoke /analyze/voice: ${error.message}`);
      throw new Error(
        error.response?.data?.detail || error.message || 'AI Service unavailable for voice transcription'
      );
    }
  },

  /**
   * Unified customer risk analysis with XGBoost, SHAP, and recommendations
   */
  analyzeCustomerRisk: async (customerId, features, anomalies = [], sentimentSummary = null) => {
    try {
      const response = await aiApiClient.post('/analyze/customer-risk', {
        customer_id: customerId,
        features,
        anomalies,
        sentiment_summary: sentimentSummary
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to invoke /analyze/customer-risk: ${error.message}`);
      throw new Error(
        error.response?.data?.detail || 'AI Service unavailable for unified customer risk evaluation'
      );
    }
  },

  /**
   * What-If counterfactual scenario risk evaluation
   */
  runWhatIf: async (customerId, baseFeatures, scenarioChanges) => {
    try {
      const response = await aiApiClient.post('/what-if/default-risk', {
        customer_id: customerId,
        base_features: baseFeatures,
        scenario_changes: scenarioChanges
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to invoke /what-if/default-risk: ${error.message}`);
      throw new Error(
        error.response?.data?.detail || error.message || 'AI Service unavailable for What-If scenario evaluation'
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

export const {
  predictDefaultRisk,
  detectTransactionAnomaly,
  analyzeSentiment,
  analyzeComplaint,
  detectRecurringIssue,
  analyzeVoice,
  analyzeCustomerRisk,
  runWhatIf
} = aiService;
