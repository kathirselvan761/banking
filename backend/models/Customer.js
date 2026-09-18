import mongoose from 'mongoose';

/**
 * Customer Data Model
 * Stores profile, risk indicators, and credit rating attributes.
 */
const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    age: Number,
    employmentType: {
      type: String,
      enum: ['Salaried', 'Self-Employed', 'Business Owner', 'Freelance', 'Other']
    },
    annualIncome: Number,
    creditScore: Number,
    accountType: String,
    accountBalance: Number,
    riskCategory: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    compositeRiskScore: {
      type: Number,
      default: 0.0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
