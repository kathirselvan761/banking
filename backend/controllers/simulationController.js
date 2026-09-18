import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';
import Complaint from '../models/Complaint.js';
import BankingEvent from '../models/BankingEvent.js';
import RiskEvent from '../models/RiskEvent.js';
import { aiService } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

/**
 * Realtime Simulation Controller
 */

// Helper to generate quick random event IDs if uuid is not imported
const generateId = (prefix = 'EVT') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Aggregates current customer + loan + activity features for XGBoost prediction
 */
async function buildCustomerFeatures(customerId, customer, loan) {
  // Count complaints & negative sentiment
  const complaints = await Complaint.find({ customer_id: customerId });
  const complaint_count = complaints.length;
  const negative_sentiment_count = complaints.filter(
    (c) => c.sentiment === 'NEGATIVE' || (c.sentiment_score !== null && c.sentiment_score < -0.3)
  ).length;

  // Count transactions & anomalies
  const transactions = await Transaction.find({ customer_id: customerId });
  const transaction_count = transactions.length || 25;
  const transaction_anomaly_count = transactions.filter((t) => t.is_anomaly).length;

  // Previous payment delays
  const failedEvents = await BankingEvent.countDocuments({
    customer_id: customerId,
    event_type: 'EMI_PAYMENT_FAILED'
  });

  return {
    credit_score: Number(customer.credit_score) || 650,
    monthly_income: Number(customer.monthly_income) || 50000,
    loan_amount: Number(loan.loan_amount) || 300000,
    monthly_emi: Number(loan.monthly_emi) || 10000,
    outstanding_amount: Number(loan.outstanding_amount) || 250000,
    overdue_amount: Number(loan.overdue_amount) || 0,
    emi_delay_count: Number(loan.emi_delay_count) || 0,
    previous_payment_delays: failedEvents || Number(loan.emi_delay_count) || 0,
    complaint_count,
    negative_sentiment_count,
    transaction_count,
    transaction_anomaly_count
  };
}

/**
 * POST /api/simulate/emi-failure/:customerId
 */
export const simulateEmiFailure = async (req, res) => {
  try {
    const { customerId } = req.params;

    // 1. Find customer
    const customer = await Customer.findOne({ customer_id: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customerId} not found`
      });
    }

    // 2. Find active loan
    const loan = await Loan.findOne({
      customer_id: customerId,
      loan_status: { $in: ['CURRENT', 'WATCHLIST', 'DELINQUENT'] }
    }) || await Loan.findOne({ customer_id: customerId });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: `No active loan found for customer ${customerId}`
      });
    }

    // 3. Increase emi_delay_count by 1
    loan.emi_delay_count = (loan.emi_delay_count || 0) + 1;

    // 4. Increase overdue_amount by monthly_emi
    const emiAmount = loan.monthly_emi || 12000;
    loan.overdue_amount = (loan.overdue_amount || 0) + emiAmount;

    if (loan.emi_delay_count >= 3) {
      loan.loan_status = 'DELINQUENT';
    } else if (loan.emi_delay_count >= 1) {
      loan.loan_status = 'WATCHLIST';
    }
    await loan.save();

    // 5. Create BankingEvent
    const bankingEvent = await BankingEvent.create({
      event_id: generateId('EVT-EMI'),
      customer_id: customerId,
      event_type: 'EMI_PAYMENT_FAILED',
      source: 'CORE_BANKING_SIMULATOR',
      amount: emiAmount,
      metadata: {
        loan_id: loan.loan_id,
        current_emi_delays: loan.emi_delay_count,
        total_overdue: loan.overdue_amount
      },
      timestamp: new Date()
    });

    // 6. Collect current customer + loan features
    const features = await buildCustomerFeatures(customerId, customer, loan);

    // 7. Send features to FastAPI & 8. Receive XGBoost prediction
    let predictionResult;
    try {
      predictionResult = await aiService.predictDefaultRisk(features);
    } catch (aiErr) {
      logger.warn(`AI service call failed during EMI simulation: ${aiErr.message}`);
      return res.status(503).json({
        success: false,
        message: `AI service unavailable: ${aiErr.message}`
      });
    }

    // 9. Create RiskEvent
    const riskEvent = await RiskEvent.create({
      event_id: generateId('RISK-EVT'),
      customer_id: customerId,
      risk_score: predictionResult.risk_score,
      risk_level: predictionResult.risk_level,
      default_probability: predictionResult.default_probability,
      trigger_event: 'EMI_PAYMENT_FAILED',
      features,
      timestamp: new Date()
    });

    // 10. Return updated risk
    return res.status(200).json({
      success: true,
      customer_id: customerId,
      event: {
        event_type: 'EMI_PAYMENT_FAILED'
      },
      risk: {
        risk_score: predictionResult.risk_score,
        risk_level: predictionResult.risk_level,
        default_probability: predictionResult.default_probability
      }
    });
  } catch (error) {
    logger.error(`Error in simulateEmiFailure: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error during EMI simulation'
    });
  }
};

/**
 * POST /api/simulate/transaction/:customerId
 */
export const simulateTransaction = async (req, res) => {
  try {
    const { customerId } = req.params;
    const {
      amount,
      transaction_type = 'PURCHASE',
      merchant_category = 'GENERAL',
      location = 'Online',
      device_id = 'DEVICE_DEFAULT',
      payment_method = 'CARD'
    } = req.body;

    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({
        success: false,
        message: 'Valid transaction amount is required'
      });
    }

    // 1. Find customer
    const customer = await Customer.findOne({ customer_id: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customerId} not found`
      });
    }

    // 2. Calculate transaction behavioral features for Isolation Forest
    const now = new Date();
    const hourOfDay = now.getHours();

    // Query past transactions for this customer to calculate frequency
    const pastTxCount = await Transaction.countDocuments({ customer_id: customerId });
    const locationFrequency = await Transaction.countDocuments({ customer_id: customerId, location }) || 1;
    const deviceFrequency = await Transaction.countDocuments({ customer_id: customerId, device_id }) || 1;

    const txFeatures = {
      amount: Number(amount),
      transaction_count: pastTxCount + 1,
      hour_of_day: hourOfDay,
      location_frequency: locationFrequency,
      device_frequency: deviceFrequency
    };

    // 3. Call FastAPI anomaly endpoint
    let anomalyResult;
    try {
      anomalyResult = await aiService.detectTransactionAnomaly(txFeatures);
    } catch (aiErr) {
      logger.warn(`AI service call failed during transaction anomaly check: ${aiErr.message}`);
      return res.status(503).json({
        success: false,
        message: `AI service unavailable: ${aiErr.message}`
      });
    }

    // 4. Save transaction with anomaly flags
    const transaction = await Transaction.create({
      transaction_id: generateId('TXN'),
      customer_id: customerId,
      amount: Number(amount),
      transaction_type,
      merchant_category,
      location,
      device_id,
      payment_method,
      status: 'COMPLETED',
      timestamp: now,
      is_anomaly: anomalyResult.is_anomaly,
      anomaly_score: anomalyResult.anomaly_score
    });

    // 5. Create BankingEvent
    await BankingEvent.create({
      event_id: generateId('EVT-TXN'),
      customer_id: customerId,
      event_type: 'TRANSACTION_COMPLETED',
      source: 'POS_GATEWAY',
      amount: Number(amount),
      metadata: {
        transaction_id: transaction.transaction_id,
        is_anomaly: anomalyResult.is_anomaly,
        anomaly_score: anomalyResult.anomaly_score
      },
      timestamp: now
    });

    // 6. Return response
    return res.status(200).json({
      success: true,
      transaction: {
        transaction_id: transaction.transaction_id,
        customer_id: transaction.customer_id,
        amount: transaction.amount,
        merchant_category: transaction.merchant_category,
        location: transaction.location,
        timestamp: transaction.timestamp,
        is_anomaly: transaction.is_anomaly,
        anomaly_score: transaction.anomaly_score
      },
      anomaly: {
        is_anomaly: anomalyResult.is_anomaly,
        anomaly_score: anomalyResult.anomaly_score
      }
    });
  } catch (error) {
    logger.error(`Error in simulateTransaction: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error during transaction simulation'
    });
  }
};
