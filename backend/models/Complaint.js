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
      default: 'General'
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
    sentiment: {
      type: String,
      default: null
    },
    sentiment_score: {
      type: Number,
      default: null
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
