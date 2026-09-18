import express from 'express';
import { 
  getCustomerRisk, 
  getCustomerRiskHistory, 
  getRiskAlerts 
} from '../controllers/riskController.js';

const router = express.Router();

// GET /api/risk/alerts
router.get('/alerts', getRiskAlerts);

// GET /api/risk/:customerId/history
router.get('/:customerId/history', getCustomerRiskHistory);

// GET /api/risk/:customerId
router.get('/:customerId', getCustomerRisk);

export default router;
