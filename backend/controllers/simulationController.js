import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';
import Complaint from '../models/Complaint.js';
import BankingEvent from '../models/BankingEvent.js';
import RiskEvent from '../models/RiskEvent.js';
import VoiceTranscript from '../models/VoiceTranscript.js';
import { aiService } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

// Helper to generate quick random event IDs
const generateId = (prefix = 'EVT') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Aggregates current customer + loan + activity features for XGBoost prediction
 */
export async function buildCustomerFeatures(customerId, customer, loan) {
  // Count complaints, negative sentiment, high severity, and recurring issues
  const complaints = await Complaint.find({ customer_id: customerId });
  const complaint_count = complaints.length;
  const negative_sentiment_count = complaints.filter(
    (c) => c.sentiment === 'negative' || (c.sentiment_score !== null && c.sentiment_score < -0.3)
  ).length;
  const high_severity_complaint_count = complaints.filter(
    (c) => (c.priority && ['HIGH', 'CRITICAL'].includes(c.priority.toUpperCase())) ||
           (c.severity && ['high', 'critical'].includes(c.severity.toLowerCase()))
  ).length;
  const recurring_issue_count = complaints.filter((c) => c.is_recurring).length;

  // Count voice calls
  const voiceTranscripts = await VoiceTranscript.find({ customer_id: customerId });
  const voice_call_count = voiceTranscripts.length;

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
    transaction_anomaly_count,
    // Extended NLP & behavioral features
    high_severity_complaint_count,
    recurring_issue_count,
    voice_call_count,
    avg_complaint_resolution_time: 24
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
    await BankingEvent.create({
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

    // 7. Send features to FastAPI & 8. Receive XGBoost + SHAP prediction
    let predictionResult;
    try {
      predictionResult = await aiService.analyzeCustomerRisk(customerId, features);
    } catch (aiErr) {
      logger.warn(`AI service call failed during EMI simulation: ${aiErr.message}`);
      return res.status(503).json({
        success: false,
        message: `AI service unavailable: ${aiErr.message}`
      });
    }

    // 9. Create RiskEvent
    await RiskEvent.create({
      event_id: generateId('RISK-EVT'),
      customer_id: customerId,
      risk_score: predictionResult.current_risk.score,
      risk_level: predictionResult.current_risk.level,
      default_probability: predictionResult.future_default_probability,
      future_probability: predictionResult.future_default_probability,
      trigger_event: 'EMI_PAYMENT_FAILED',
      event_type: 'EMI_PAYMENT_FAILED',
      important_risk_signals: predictionResult.important_risk_signals || [],
      recommendations: predictionResult.recommendations || [],
      features: {
        ...features,
        important_risk_signals: predictionResult.important_risk_signals,
        recommendations: predictionResult.recommendations
      },
      timestamp: new Date()
    });

    // 10. Return updated risk (Preserving Step 3 contract + Step 4 enhancements)
    return res.status(200).json({
      success: true,
      customer_id: customerId,
      event: {
        event_type: 'EMI_PAYMENT_FAILED'
      },
      risk: {
        risk_score: predictionResult.current_risk.score,
        risk_level: predictionResult.current_risk.level,
        default_probability: predictionResult.future_default_probability,
        future_probability: predictionResult.future_default_probability,
        important_risk_signals: predictionResult.important_risk_signals || [],
        recommendations: predictionResult.recommendations || []
      },
      recommendations: predictionResult.recommendations || []
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

    const customer = await Customer.findOne({ customer_id: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customerId} not found`
      });
    }

    const now = new Date();
    const hourOfDay = now.getHours();

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

/**
 * POST /api/simulate/complaint/:customerId
 * Realtime Complaint Grievance Event
 */
export const simulateComplaint = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Complaint text is required'
      });
    }

    const customer = await Customer.findOne({ customer_id: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customerId} not found`
      });
    }

    const loan = await Loan.findOne({ customer_id: customerId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: `No loan found for customer ${customerId}`
      });
    }

    // 1. Call NLP analysis
    let nlpResult;
    try {
      nlpResult = await aiService.analyzeComplaint(text);
    } catch (aiErr) {
      logger.warn(`AI service call failed during complaint NLP: ${aiErr.message}`);
      return res.status(503).json({
        success: false,
        message: `AI service unavailable: ${aiErr.message}`
      });
    }

    // 2. Fetch past complaints to detect recurring issues using SBERT
    const pastComplaints = await Complaint.find({ customer_id: customerId });
    let recurringResult = {
      is_recurring: false,
      similarity_score: 0.0,
      related_issue: 'None',
      matched_complaint: ''
    };

    if (pastComplaints.length > 0) {
      try {
        const pastDescriptions = pastComplaints.map((c) => c.description).filter(Boolean);
        if (pastDescriptions.length > 0) {
          recurringResult = await aiService.detectRecurringIssue(text, pastDescriptions);
        }
      } catch (sbertErr) {
        logger.warn(`SBERT recurring issue check failed: ${sbertErr.message}`);
      }
    }

    // 3. Save Complaint in MongoDB
    const complaint = await Complaint.create({
      complaint_id: generateId('CMP'),
      customer_id: customerId,
      category: nlpResult.category,
      description: text,
      status: 'OPEN',
      priority: nlpResult.severity.toUpperCase(),
      severity: nlpResult.severity,
      sentiment: nlpResult.sentiment,
      sentiment_score: nlpResult.sentiment === 'negative' ? -0.85 : (nlpResult.sentiment === 'positive' ? 0.8 : 0.0),
      keywords: nlpResult.keywords,
      is_recurring: recurringResult.is_recurring,
      similarity_score: recurringResult.similarity_score,
      related_issue: recurringResult.related_issue,
      created_at: new Date()
    });

    // 4. Create BankingEvent
    await BankingEvent.create({
      event_id: generateId('EVT-CMP'),
      customer_id: customerId,
      event_type: 'COMPLAINT_CREATED',
      source: 'CUSTOMER_SERVICE_DESK',
      amount: 0,
      metadata: {
        complaint_id: complaint.complaint_id,
        category: nlpResult.category,
        sentiment: nlpResult.sentiment,
        severity: nlpResult.severity,
        keywords: nlpResult.keywords,
        is_recurring: recurringResult.is_recurring,
        similarity_score: recurringResult.similarity_score
      },
      timestamp: new Date()
    });

    // 5. Update customer features & recompute unified risk
    const features = await buildCustomerFeatures(customerId, customer, loan);
    const riskResult = await aiService.analyzeCustomerRisk(customerId, features);

    // 6. Record updated RiskEvent
    await RiskEvent.create({
      event_id: generateId('RISK-EVT'),
      customer_id: customerId,
      risk_score: riskResult.current_risk.score,
      risk_level: riskResult.current_risk.level,
      default_probability: riskResult.future_default_probability,
      future_probability: riskResult.future_default_probability,
      trigger_event: 'COMPLAINT_CREATED',
      event_type: 'COMPLAINT_CREATED',
      important_risk_signals: riskResult.important_risk_signals || [],
      recommendations: riskResult.recommendations || [],
      features: {
        ...features,
        important_risk_signals: riskResult.important_risk_signals,
        recommendations: riskResult.recommendations
      },
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      customer_id: customerId,
      complaint_analysis: {
        category: nlpResult.category,
        sentiment: nlpResult.sentiment,
        severity: nlpResult.severity,
        keywords: nlpResult.keywords,
        recurring: recurringResult
      },
      complaint: {
        complaint_id: complaint.complaint_id,
        category: nlpResult.category,
        sentiment: nlpResult.sentiment,
        severity: nlpResult.severity,
        keywords: nlpResult.keywords
      },
      recurring_issue: recurringResult,
      risk: {
        risk_score: riskResult.current_risk.score,
        risk_level: riskResult.current_risk.level,
        default_probability: riskResult.future_default_probability,
        future_probability: riskResult.future_default_probability,
        important_risk_signals: riskResult.important_risk_signals || [],
        recommendations: riskResult.recommendations || []
      },
      recommendations: riskResult.recommendations || []
    });
  } catch (error) {
    logger.error(`Error in simulateComplaint: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error during complaint simulation'
    });
  }
};
