import mongoose from 'mongoose';

/**
 * Risk Event Schema
 * Collection: risk_events
 */
const riskEventSchema = new mongoose.Schema(
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
    risk_score: {
      type: Number,
      required: true
    },
    risk_level: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    default_probability: {
      type: Number,
      required: true
    },
    trigger_event: {
      type: String,
      default: 'MANUAL_OR_SYSTEM'
    },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'risk_events'
  }
);

export default mongoose.models.RiskEvent || mongoose.model('RiskEvent', riskEventSchema);
