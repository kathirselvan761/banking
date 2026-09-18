import mongoose from 'mongoose';

/**
 * Transaction Schema
 * Collection: transactions
 */
const transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
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
    amount: {
      type: Number,
      required: true
    },
    transaction_type: {
      type: String,
      default: 'PURCHASE'
    },
    merchant_category: {
      type: String,
      default: 'GENERAL'
    },
    location: {
      type: String,
      default: 'Online'
    },
    device_id: {
      type: String,
      default: 'DEFAULT_DEVICE'
    },
    payment_method: {
      type: String,
      default: 'CARD'
    },
    status: {
      type: String,
      default: 'COMPLETED'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    is_anomaly: {
      type: Boolean,
      default: false
    },
    anomaly_score: {
      type: Number,
      default: 0.0
    }
  },
  {
    collection: 'transactions'
  }
);

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
