import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';
import Complaint from '../models/Complaint.js';
import BankingEvent from '../models/BankingEvent.js';
import VoiceTranscript from '../models/VoiceTranscript.js';

/**
 * Feature Engineering Service
 * Assembles customer profile, loan status, telemetry, complaints, and voice interactions
 * into normalized feature dictionaries for XGBoost model inference.
 */
export async function buildCustomerFeatures(customerId, customer = null, loan = null) {
  // If customer or loan not provided, fetch from database
  if (!customer) {
    customer = await Customer.findOne({ customer_id: customerId });
  }
  if (!loan) {
    loan = await Loan.findOne({
      customer_id: customerId,
      loan_status: { $in: ['CURRENT', 'WATCHLIST', 'DELINQUENT'] },
    }) || await Loan.findOne({ customer_id: customerId });
  }

  // Aggregate customer complaint metrics
  const complaints = await Complaint.find({ customer_id: customerId });
  const complaint_count = complaints.length;
  const negative_sentiment_count = complaints.filter(
    (c) => c.sentiment === 'negative' || (c.sentiment_score !== null && c.sentiment_score < -0.3)
  ).length;
  const high_severity_complaint_count = complaints.filter(
    (c) =>
      (c.priority && ['HIGH', 'CRITICAL'].includes(c.priority.toUpperCase())) ||
      (c.severity && ['high', 'critical'].includes(c.severity.toLowerCase()))
  ).length;
  const recurring_issue_count = complaints.filter((c) => c.is_recurring).length;

  // Aggregate voice call interactions
  const voiceTranscripts = await VoiceTranscript.find({ customer_id: customerId });
  const voice_call_count = voiceTranscripts.length;

  // Aggregate transactions and anomaly tags
  const transactions = await Transaction.find({ customer_id: customerId });
  const transaction_count = transactions.length || 25;
  const transaction_anomaly_count = transactions.filter((t) => t.is_anomaly).length;

  // Historical payment delay events
  const failedEvents = await BankingEvent.countDocuments({
    customer_id: customerId,
    event_type: 'EMI_PAYMENT_FAILED',
  });

  return {
    credit_score: Number(customer?.credit_score) || 650,
    income: Number(customer?.monthly_income) || 50000,
    monthly_income: Number(customer?.monthly_income) || 50000,
    loan_amount: Number(loan?.loan_amount) || 300000,
    monthly_emi: Number(loan?.monthly_emi) || 10000,
    outstanding_amount: Number(loan?.outstanding_amount) || 250000,
    overdue_amount: Number(loan?.overdue_amount) || 0,
    payment_delay_count: failedEvents || Number(loan?.emi_delay_count) || 0,
    emi_delay_count: Number(loan?.emi_delay_count) || 0,
    previous_payment_delays: failedEvents || Number(loan?.emi_delay_count) || 0,
    complaint_count,
    negative_sentiment_count,
    transaction_count,
    transaction_anomaly_count,
    high_severity_complaint_count,
    recurring_issue_count,
    voice_call_count,
    avg_complaint_resolution_time: 24,
  };
}

export default {
  buildCustomerFeatures,
};
