import express from 'express';
import { simulateEmiFailure, simulateTransaction } from '../controllers/simulationController.js';

const router = express.Router();

// POST /api/simulate/emi-failure/:customerId
router.post('/emi-failure/:customerId', simulateEmiFailure);

// POST /api/simulate/transaction/:customerId
router.post('/transaction/:customerId', simulateTransaction);

export default router;
