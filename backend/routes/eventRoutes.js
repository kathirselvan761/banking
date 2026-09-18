import express from 'express';
import { getCustomerEvents } from '../controllers/eventController.js';

const router = express.Router();

// GET /api/events/customer/:customerId
router.get('/customer/:customerId', getCustomerEvents);

export default router;
