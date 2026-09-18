import mongoose from 'mongoose';

/**
 * Voice Transcript Schema
 * Collection: voice_transcripts
 */
const voiceTranscriptSchema = new mongoose.Schema(
  {
    customer_id: {
      type: String,
      required: true,
      index: true
    },
    audio_filename: {
      type: String,
      required: true
    },
    transcript: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: 'en'
    },
    sentiment: {
      type: String,
      default: 'neutral'
    },
    category: {
      type: String,
      default: 'GENERAL'
    },
    severity: {
      type: String,
      default: 'medium'
    },
    keywords: {
      type: [String],
      default: []
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'voice_transcripts'
  }
);

export default mongoose.models.VoiceTranscript || mongoose.model('VoiceTranscript', voiceTranscriptSchema);
