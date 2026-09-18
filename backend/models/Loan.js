import mongoose from 'mongoose';

/**
 * Loan Data Model
 * Tracks exposure, installment status, and days past due (DPD) for early default detection.
 */
const loanSchema = new mongoose.Schema(
  {
    loanId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerId: {
      type: String,
      required: true,
      ref: 'Customer',
      index: true
    },
    loanType: {
      type: String,
      enum: ['Mortgage', 'Commercial', 'Personal', 'Auto', 'Working_Capital']
    },
    principalAmount: Number,
    interestRate: Number,
    termMonths: Number,
    monthlyInstallment: Number,
    outstandingBalance: Number,
    daysPastDue: {
      type: Number,
      default: 0
    },
    delinquencyStatus: {
      type: String,
      enum: ['CURRENT', 'WATCHLIST', 'EARLY_DEFAULT', 'CRITICAL_RISK', 'NPA'],
      default: 'CURRENT'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Loan || mongoose.model('Loan', loanSchema);
