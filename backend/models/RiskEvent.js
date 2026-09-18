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
      index: true,
      default: () => `RISK-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
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
    future_probability: {
      type: Number
    },
    trigger_event: {
      type: String,
      default: 'MANUAL_OR_SYSTEM'
    },
    event_type: {
      type: String
    },
    important_risk_signals: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    recommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
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

// Sync probability and event aliases before saving
riskEventSchema.pre('save', function (next) {
  if (this.default_probability !== undefined && this.future_probability === undefined) {
    this.future_probability = this.default_probability;
  }
  if (this.future_probability !== undefined && this.default_probability === undefined) {
    this.default_probability = this.future_probability;
  }
  if (this.trigger_event && !this.event_type) {
    this.event_type = this.trigger_event;
  }
  if (this.event_type && !this.trigger_event) {
    this.trigger_event = this.event_type;
  }
  next();
});

export default mongoose.models.RiskEvent || mongoose.model('RiskEvent', riskEventSchema);
