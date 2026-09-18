import mongoose from 'mongoose';

/**
 * Complaint Schema
 * Collection: complaints
 */
const complaintSchema = new mongoose.Schema(
  {
    complaint_id: {
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
    category: {
      type: String,
      default: 'OTHER'
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'OPEN'
    },
    priority: {
      type: String,
      default: 'MEDIUM'
    },
    severity: {
      type: String,
      default: 'medium'
    },
    sentiment: {
      type: String,
      default: null
    },
    sentiment_score: {
      type: Number,
      default: null
    },
    keywords: {
      type: [String],
      default: []
    },
    is_recurring: {
      type: Boolean,
      default: false
    },
    similarity_score: {
      type: Number,
      default: 0.0
    },
    related_issue: {
      type: String,
      default: 'None'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'complaints'
  }
);

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
