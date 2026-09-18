import express from 'express';
import { getCustomers, getCustomerById } from '../controllers/customerController.js';

const router = express.Router();

// GET /api/customers
router.get('/', getCustomers);

// GET /api/customers/:customerId
router.get('/:customerId', getCustomerById);

export default router;
