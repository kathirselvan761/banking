import express from 'express';
import { getCustomerRisk } from '../controllers/riskController.js';

const router = express.Router();

// GET /api/risk/:customerId
router.get('/:customerId', getCustomerRisk);

export default router;
