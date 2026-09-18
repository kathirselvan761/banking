import express from 'express';
import { getActiveAlerts, triggerRiskEvaluation } from '../controllers/riskController.js';

const router = express.Router();

router.get('/alerts', getActiveAlerts);
router.post('/evaluate/:customerId', triggerRiskEvaluation);

export default router;
