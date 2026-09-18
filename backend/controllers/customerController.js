import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';
import Complaint from '../models/Complaint.js';
import BankingEvent from '../models/BankingEvent.js';
import RiskEvent from '../models/RiskEvent.js';
import VoiceTranscript from '../models/VoiceTranscript.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/customers
 * Returns all banking customers enriched with their latest risk status, complaints count, and last event
 */
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ created_at: -1 }).lean();

    // Concurrently fetch latest risk events and activity for all customers
    const enriched = await Promise.all(
      customers.map(async (c) => {
        const [latestRisk, complaintCount, lastEvent] = await Promise.all([
          RiskEvent.findOne({ customer_id: c.customer_id }).sort({ timestamp: -1, created_at: -1 }).lean(),
          Complaint.countDocuments({ customer_id: c.customer_id }),
          BankingEvent.findOne({ customer_id: c.customer_id }).sort({ timestamp: -1 }).lean()
        ]);

        return {
          ...c,
          risk_score: latestRisk ? latestRisk.risk_score : 15,
          risk_level: latestRisk ? latestRisk.risk_level : 'LOW',
          future_default_probability: latestRisk ? (latestRisk.future_probability ?? latestRisk.default_probability) : 0.15,
          default_probability: latestRisk ? latestRisk.default_probability : 0.15,
          complaint_count: complaintCount,
          last_event: lastEvent ? lastEvent.event_type : 'ACCOUNT_OPENED'
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
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
    const [loan, transactions, complaints, events, latestRisk, voiceTranscripts] = await Promise.all([
      Loan.findOne({ customer_id: customerId }),
      Transaction.find({ customer_id: customerId }).sort({ timestamp: -1 }).limit(25),
      Complaint.find({ customer_id: customerId }).sort({ created_at: -1 }).limit(25),
      BankingEvent.find({ customer_id: customerId }).sort({ timestamp: -1 }).limit(25),
      RiskEvent.findOne({ customer_id: customerId }).sort({ timestamp: -1, created_at: -1 }),
      VoiceTranscript.find({ customer_id: customerId }).sort({ created_at: -1 }).limit(10)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        customer,
        loan: loan || null,
        recent_transactions: transactions || [],
        complaints: complaints || [],
        voice_transcripts: voiceTranscripts || [],
        recent_events: events || [],
        latest_risk: latestRisk ? {
          risk_score: latestRisk.risk_score,
          risk_level: latestRisk.risk_level,
          default_probability: latestRisk.default_probability,
          future_probability: latestRisk.future_probability ?? latestRisk.default_probability,
          future_default_probability: latestRisk.future_probability ?? latestRisk.default_probability,
          important_risk_signals: latestRisk.important_risk_signals || [],
          recommendations: latestRisk.recommendations || [],
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
