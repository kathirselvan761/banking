import mongoose from 'mongoose';

/**
 * Customer Schema
 * Collection: customers
 */
const customerSchema = new mongoose.Schema(
  {
    customer_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    monthly_income: {
      type: Number,
      required: true
    },
    credit_score: {
      type: Number,
      required: true
    },
    employment_type: {
      type: String,
      default: 'Salaried'
    },
    account_status: {
      type: String,
      default: 'ACTIVE'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'customers'
  }
);

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
