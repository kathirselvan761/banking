import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';
import Complaint from '../models/Complaint.js';
import BankingEvent from '../models/BankingEvent.js';
import RiskEvent from '../models/RiskEvent.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/customers
 * Returns all banking customers with their primary loan status and risk level
 */
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ created_at: -1 });
    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    logger.error(`Error in getCustomers: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customers'
    });
  }
};

/**
 * GET /api/customers/:customerId
 * Customer details including customer, loan, recent transactions, complaints, recent events, latest risk
 */
export const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findOne({ customer_id: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customerId} not found`
      });
    }

    // Fetch related records concurrently
    const [loan, transactions, complaints, events, latestRisk] = await Promise.all([
      Loan.findOne({ customer_id: customerId }),
      Transaction.find({ customer_id: customerId }).sort({ timestamp: -1 }).limit(10),
      Complaint.find({ customer_id: customerId }).sort({ created_at: -1 }).limit(5),
      BankingEvent.find({ customer_id: customerId }).sort({ timestamp: -1 }).limit(10),
      RiskEvent.findOne({ customer_id: customerId }).sort({ timestamp: -1 })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customer,
        loan: loan || null,
        recent_transactions: transactions || [],
        complaints: complaints || [],
        recent_events: events || [],
        latest_risk: latestRisk ? {
          risk_score: latestRisk.risk_score,
          risk_level: latestRisk.risk_level,
          default_probability: latestRisk.default_probability,
          trigger_event: latestRisk.trigger_event,
          timestamp: latestRisk.timestamp
        } : null
      }
    });
  } catch (error) {
    logger.error(`Error in getCustomerById: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching customer details'
    });
  }
};
