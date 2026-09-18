import RiskEvent from '../models/RiskEvent.js';
import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import { aiService } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

/**
 * Customer Risk Controller
 * Endpoint: GET /api/risk/:customerId
 */
export const getCustomerRisk = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if customer exists
    const customer = await Customer.findOne({ customer_id: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customerId} not found`
      });
    }

    // Find latest RiskEvent
    let latestRisk = await RiskEvent.findOne({ customer_id: customerId })
      .sort({ timestamp: -1, created_at: -1 });

    // If no prior risk event has been recorded, compute a baseline one
    if (!latestRisk) {
      const loan = await Loan.findOne({ customer_id: customerId });
      if (loan) {
        try {
          const prediction = await aiService.predictDefaultRisk({
            credit_score: customer.credit_score,
            monthly_income: customer.monthly_income,
            loan_amount: loan.loan_amount,
            monthly_emi: loan.monthly_emi,
            outstanding_amount: loan.outstanding_amount,
            overdue_amount: loan.overdue_amount || 0,
            emi_delay_count: loan.emi_delay_count || 0,
            previous_payment_delays: loan.emi_delay_count || 0,
            complaint_count: 0,
            negative_sentiment_count: 0,
            transaction_count: 30,
            transaction_anomaly_count: 0
          });

          latestRisk = await RiskEvent.create({
            event_id: `RISK-BASELINE-${Date.now()}`,
            customer_id: customerId,
            risk_score: prediction.risk_score,
            risk_level: prediction.risk_level,
            default_probability: prediction.default_probability,
            trigger_event: 'BASELINE_INITIALIZATION',
            features: {}
          });
        } catch (aiErr) {
          logger.warn(`Could not compute baseline risk from AI service: ${aiErr.message}`);
        }
      }
    }

    if (!latestRisk) {
      return res.status(200).json({
        success: true,
        customer_id: customerId,
        risk: {
          risk_score: 0,
          risk_level: "LOW",
          future_default_probability: 0.0
        }
      });
    }

    return res.status(200).json({
      success: true,
      customer_id: customerId,
      risk: {
        risk_score: latestRisk.risk_score,
        risk_level: latestRisk.risk_level,
        future_default_probability: latestRisk.default_probability
      }
    });
  } catch (error) {
    logger.error(`Error in getCustomerRisk: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving customer risk'
    });
  }
};
