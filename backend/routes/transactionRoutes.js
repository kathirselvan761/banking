import express from 'express';
import Transaction from '../models/Transaction.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/transactions
 * Returns recent transactions across customers
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const transactions = await Transaction.find().sort({ timestamp: -1 }).limit(limit);
    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    logger.error(`Error in getTransactions: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching transactions'
    });
  }
});

export default router;
