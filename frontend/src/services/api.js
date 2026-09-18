import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

// Axios client for Node.js Express Backend
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios client for Python FastAPI Service (Direct)
export const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Health Check API Services
 */
export const checkBackendHealth = async () => {
  try {
    const res = await apiClient.get('/health');
    return { online: true, data: res.data };
  } catch (err) {
    return { online: false, error: err.message };
  }
};

export const checkAiServiceHealth = async () => {
  try {
    const res = await aiClient.get('/health');
    return { online: true, data: res.data };
  } catch (err) {
    return { online: false, error: err.message };
  }
};
