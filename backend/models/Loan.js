import mongoose from 'mongoose';

/**
 * Loan Schema
 * Collection: loans
 */
const loanSchema = new mongoose.Schema(
  {
    loan_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer_id: {
      type: String,
      required: true,
      index: true
    },
    loan_type: {
      type: String,
      default: 'Personal'
    },
    loan_amount: {
      type: Number,
      required: true
    },
    monthly_emi: {
      type: Number,
      required: true
    },
    outstanding_amount: {
      type: Number,
      required: true
    },
    overdue_amount: {
      type: Number,
      default: 0
    },
    emi_delay_count: {
      type: Number,
      default: 0
    },
    loan_status: {
      type: String,
      default: 'CURRENT'
    },
    start_date: {
      type: Date,
      default: Date.now
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'loans'
  }
);

export default mongoose.models.Loan || mongoose.model('Loan', loanSchema);
