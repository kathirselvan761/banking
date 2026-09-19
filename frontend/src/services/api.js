import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawBaseUrl.replace(/\/api\/?$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Banking Risk & Decision Intelligence API Service Layer
 */
export const api = {
  // Health
  checkHealth: async () => {
    const res = await apiClient.get('/api/health');
    return res.data;
  },
  checkBackendHealth: async () => {
    const res = await apiClient.get('/api/health');
    return res.data;
  },
  checkAiServiceHealth: async () => {
    const res = await apiClient.get('/api/health');
    return res.data;
  },

  // Portfolio Overview
  getOverview: async () => {
    const res = await apiClient.get('/api/risk/overview');
    return res.data;
  },

  // Customers
  getCustomers: async (riskLevel = null) => {
    const url = riskLevel ? `/api/customers?risk_level=${riskLevel}` : '/api/customers';
    const res = await apiClient.get(url);
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

  getCustomerEvents: async (customerId) => {
    const res = await apiClient.get(`/api/risk/${customerId}/history`);
    return res.data;
  },

  // Agentic AI Loop
  runInvestigation: async (customerId) => {
    const res = await apiClient.post(`/api/investigation/run/${customerId}`);
    return res.data;
  },

  getInvestigationTrail: async (customerId) => {
    const res = await apiClient.get(`/api/investigation/${customerId}`);
    return res.data;
  },

  // What-If Decision Intelligence
  simulateWhatIf: async (payload) => {
    const res = await apiClient.post('/api/what-if/simulate', payload);
    return res.data;
  },
  runWhatIf: async (payload) => {
    const res = await apiClient.post('/api/what-if/simulate', payload);
    return res.data;
  },

  getWhatIfDefault: async (customerId) => {
    const res = await apiClient.get(`/api/what-if/${customerId}`);
    return res.data;
  },
  getWhatIfHistory: async (customerId) => {
    const res = await apiClient.get(`/api/what-if/${customerId}`);
    return res.data;
  },

  // Alerts
  getRiskAlerts: async (severity = null) => {
    const url = severity ? `/api/alerts?severity=${severity}` : '/api/alerts';
    const res = await apiClient.get(url);
    return res.data;
  },

  resolveAlert: async (alertId) => {
    const res = await apiClient.patch(`/api/alerts/${alertId}/resolve`);
    return res.data;
  },

  // SBERT Semantic Recurring Complaints
  getRecurringClusters: async () => {
    const res = await apiClient.get('/api/complaints/recurring-clusters');
    return res.data;
  },

  getComplaints: async (customerId = null) => {
    const url = customerId ? `/api/complaints?customer_id=${customerId}` : '/api/complaints';
    const res = await apiClient.get(url);
    return res.data;
  },

  // Transactions & Isolation Forest
  getTransactions: async (customerId = null) => {
    const url = customerId ? `/api/transactions?customer_id=${customerId}` : '/api/transactions';
    const res = await apiClient.get(url);
    return res.data;
  },

  checkAnomaly: async (data) => {
    const res = await apiClient.post('/api/transactions/anomaly-check', data);
    return res.data;
  },

  // Ingestion Layer
  ingestEmail: async (data) => {
    const res = await apiClient.post('/api/ingest/email', data);
    return res.data;
  },

  ingestFeedback: async (data) => {
    const res = await apiClient.post('/api/ingest/feedback', data);
    return res.data;
  },

  ingestAudio: async (formData) => {
    const res = await apiClient.post('/api/ingest/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
    return res.data;
  },

  uploadVoice: async (customerId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customer_id', customerId);
    const res = await apiClient.post('/api/ingest/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
    return res.data;
  },

  ingestTransaction: async (data) => {
    const res = await apiClient.post('/api/ingest/transaction', data);
    return res.data;
  },

  ingestLoan: async (data) => {
    const res = await apiClient.post('/api/ingest/loan', data);
    return res.data;
  },

  ingestSystemLog: async (data) => {
    const res = await apiClient.post('/api/ingest/system-log', data);
    return res.data;
  },

  // Simulation helpers
  simulateEmiFailure: async (customerId) => {
    return api.ingestLoan({ customer_id: customerId, principal_amount: 300000, monthly_emi: 12000, overdue_amount: 24000, emi_delay_count: 2 });
  },
  simulateEMIFailure: async (customerId) => {
    return api.simulateEmiFailure(customerId);
  },
  simulateComplaint: async (customerId, text) => {
    return api.ingestFeedback({ customer_id: customerId, feedback_text: text });
  },
  simulateTransaction: async (customerId, data = {}) => {
    return api.ingestTransaction({ customer_id: customerId, amount: data.amount || 75000, type: "DEBIT" });
  }
};

export const {
  checkHealth,
  checkBackendHealth,
  checkAiServiceHealth,
  getOverview,
  getCustomers,
  getCustomer,
  getCustomerRisk,
  getCustomerRiskHistory,
  getCustomerEvents,
  runInvestigation,
  getInvestigationTrail,
  simulateWhatIf,
  runWhatIf,
  getWhatIfDefault,
  getWhatIfHistory,
  getRiskAlerts,
  resolveAlert,
  getRecurringClusters,
  getComplaints,
  getTransactions,
  checkAnomaly,
  ingestEmail,
  ingestFeedback,
  ingestAudio,
  uploadVoice,
  ingestTransaction,
  ingestLoan,
  ingestSystemLog,
  simulateEmiFailure,
  simulateEMIFailure,
  simulateComplaint,
  simulateTransaction
} = api;

export default api;
