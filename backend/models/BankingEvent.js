import mongoose from 'mongoose';

/**
 * Banking Event Schema
 * Collection: banking_events
 */
const bankingEventSchema = new mongoose.Schema(
  {
    event_id: {
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
    event_type: {
      type: String,
      required: true,
      enum: [
        'EMI_PAYMENT_SUCCESS',
        'EMI_PAYMENT_FAILED',
        'LOAN_OVERDUE_UPDATED',
        'TRANSACTION_COMPLETED',
        'TRANSACTION_FAILED',
        'COMPLAINT_CREATED',
        'VOICE_CALL_RECEIVED'
      ]
    },
    source: {
      type: String,
      default: 'CORE_BANKING'
    },
    amount: {
      type: Number,
      default: 0
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    processed: {
      type: Boolean,
      default: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'banking_events'
  }
);

export default mongoose.models.BankingEvent || mongoose.model('BankingEvent', bankingEventSchema);
