import express from 'express';
import { 
  simulateEmiFailure, 
  simulateTransaction, 
  simulateComplaint 
} from '../controllers/simulationController.js';

const router = express.Router();

// POST /api/simulate/emi-failure/:customerId
router.post('/emi-failure/:customerId', simulateEmiFailure);

// POST /api/simulate/transaction/:customerId
router.post('/transaction/:customerId', simulateTransaction);

// POST /api/simulate/complaint/:customerId
router.post('/complaint/:customerId', simulateComplaint);

export default router;
