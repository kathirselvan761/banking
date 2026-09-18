import BankingEvent from '../models/BankingEvent.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/events/customer/:customerId
 * Returns historical banking events for a customer
 */
export const getCustomerEvents = async (req, res) => {
  try {
    const { customerId } = req.params;
    const events = await BankingEvent.find({ customer_id: customerId }).sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      customer_id: customerId,
      count: events.length,
      data: events
    });
  } catch (error) {
    logger.error(`Error in getCustomerEvents: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customer banking events'
    });
  }
};
