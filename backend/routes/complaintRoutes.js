import express from 'express';
import Complaint from '../models/Complaint.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/complaints
 * Returns recent complaints across customers
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const complaints = await Complaint.find().sort({ created_at: -1 }).limit(limit);
    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    logger.error(`Error in getComplaints: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching complaints'
    });
  }
});

export default router;
