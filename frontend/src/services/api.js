import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_BASE_URL = rawBaseUrl.replace(/\/api\/?$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Banking Risk API Services
 */
export const api = {
  // Customers
  getCustomers: async () => {
    const res = await apiClient.get('/api/customers');
    return res.data;
  },

  getCustomer: async (customerId) => {
    const res = await apiClient.get(`/api/customers/${customerId}`);
    return res.data;
  },

  // Risk & Scoring
  getCustomerRisk: async (customerId) => {
    const res = await apiClient.get(`/api/risk/${customerId}`);
    return res.data;
  },

  getCustomerRiskHistory: async (customerId) => {
    const res = await apiClient.get(`/api/risk/${customerId}/history`);
    return res.data;
  },

  getRiskAlerts: async () => {
    const res = await apiClient.get('/api/risk/alerts');
    return res.data;
  },

  // Events & Audit
  getCustomerEvents: async (customerId) => {
    const res = await apiClient.get(`/api/events/customer/${customerId}`);
    return res.data;
  },

  // Complaints & Transactions
  getComplaints: async (limit = 50) => {
    const res = await apiClient.get(`/api/complaints?limit=${limit}`);
    return res.data;
  },

  getTransactions: async (limit = 50) => {
    const res = await apiClient.get(`/api/transactions?limit=${limit}`);
    return res.data;
  },

  // Realtime Simulation Endpoints
  simulateEmiFailure: async (customerId) => {
    const res = await apiClient.post(`/api/simulate/emi-failure/${customerId}`);
    return res.data;
  },
  simulateEMIFailure: async (customerId) => {
    const res = await apiClient.post(`/api/simulate/emi-failure/${customerId}`);
    return res.data;
  },

  simulateComplaint: async (customerId, text) => {
    const res = await apiClient.post(`/api/simulate/complaint/${customerId}`, { text });
    return res.data;
  },

  simulateTransaction: async (customerId, data = {}) => {
    const res = await apiClient.post(`/api/simulate/transaction/${customerId}`, data);
    return res.data;
  },

  uploadVoice: async (customerId, file) => {
    const formData = new FormData();
    formData.append('audio', file);
    const res = await apiClient.post(`/api/customers/${customerId}/voice`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 45000,
    });
    return res.data;
  },

  // System Health
  checkHealth: async () => {
    const res = await apiClient.get('/api/health');
    return res.data;
  },

  // What-If Decision Intelligence
  runWhatIf: async (data) => {
    const res = await apiClient.post('/api/what-if/default-risk', data);
    return res.data;
  },

  getWhatIfHistory: async (customerId) => {
    const res = await apiClient.get(`/api/what-if/${customerId}`);
    return res.data;
  }
};

export const {
  getCustomers,
  getCustomer,
  getCustomerRisk,
  getCustomerRiskHistory,
  getRiskAlerts,
  getCustomerEvents,
  getComplaints,
  getTransactions,
  simulateEmiFailure,
  simulateEMIFailure,
  simulateComplaint,
  simulateTransaction,
  uploadVoice,
  checkHealth,
  runWhatIf,
  getWhatIfHistory
} = api;

export default api;
