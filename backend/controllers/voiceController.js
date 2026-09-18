import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import BankingEvent from '../models/BankingEvent.js';
import RiskEvent from '../models/RiskEvent.js';
import VoiceTranscript from '../models/VoiceTranscript.js';
import Complaint from '../models/Complaint.js';
import { aiService } from '../services/aiService.js';
import { buildCustomerFeatures } from './simulationController.js';
import { logger } from '../utils/logger.js';

const generateId = (prefix = 'EVT') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * POST /api/customers/:customerId/voice
 * Processes voice recording through Whisper STT, SBERT similarity, and cascades to risk evaluation
 */
export const handleCustomerVoice = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }

    const customer = await Customer.findOne({ customer_id: customerId });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customerId} not found`
      });
    }

    const loan = await Loan.findOne({ customer_id: customerId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: `No active loan found for customer ${customerId}`
      });
    }

    // 1. Forward audio buffer to Python AI Service (/analyze/voice)
    let aiVoiceResult;
    try {
      aiVoiceResult = await aiService.analyzeVoice(req.file.buffer, req.file.originalname);
    } catch (aiErr) {
      logger.error(`AI voice analysis error: ${aiErr.message}`);
      return res.status(503).json({
        success: false,
        message: `AI service voice processing failed: ${aiErr.message}`
      });
    }

    // 2. Fetch past complaints and run SBERT recurring issue detection
    const pastComplaints = await Complaint.find({ customer_id: customerId });
    let recurringResult = {
      is_recurring: false,
      similarity_score: 0.0,
      related_issue: 'None',
      matched_complaint: ''
    };

    if (pastComplaints.length > 0 && aiVoiceResult.transcript) {
      try {
        const pastDescriptions = pastComplaints.map((c) => c.description).filter(Boolean);
        if (pastDescriptions.length > 0) {
          recurringResult = await aiService.detectRecurringIssue(aiVoiceResult.transcript, pastDescriptions);
        }
      } catch (sbertErr) {
        logger.warn(`SBERT recurring issue check failed during voice processing: ${sbertErr.message}`);
      }
    }

    // 3. Save VoiceTranscript in MongoDB
    const voiceRecord = await VoiceTranscript.create({
      customer_id: customerId,
      audio_filename: req.file.originalname || 'call_recording.wav',
      transcript: aiVoiceResult.transcript,
      language: aiVoiceResult.language || 'en',
      sentiment: aiVoiceResult.sentiment || 'neutral',
      category: aiVoiceResult.category || 'GENERAL',
      severity: aiVoiceResult.severity || 'medium',
      keywords: aiVoiceResult.keywords || [],
      created_at: new Date()
    });

    // 4. Create BankingEvent (VOICE_CALL_RECEIVED)
    await BankingEvent.create({
      event_id: generateId('EVT-VOICE'),
      customer_id: customerId,
      event_type: 'VOICE_CALL_RECEIVED',
      source: 'IVR_TELEPHONY',
      amount: 0,
      metadata: {
        transcript_id: voiceRecord._id,
        transcript_preview: aiVoiceResult.transcript.slice(0, 100),
        sentiment: aiVoiceResult.sentiment,
        category: aiVoiceResult.category,
        severity: aiVoiceResult.severity,
        is_recurring: recurringResult.is_recurring,
        similarity_score: recurringResult.similarity_score
      },
      timestamp: new Date()
    });

    // 5. If complaint keywords or negative distress detected, log into Complaint collection
    if (aiVoiceResult.sentiment === 'negative' || aiVoiceResult.severity === 'high' || aiVoiceResult.severity === 'critical') {
      await Complaint.create({
        complaint_id: generateId('CMP-VOICE'),
        customer_id: customerId,
        category: aiVoiceResult.category,
        description: `[Voice Call]: ${aiVoiceResult.transcript}`,
        status: 'OPEN',
        priority: aiVoiceResult.severity.toUpperCase(),
        severity: aiVoiceResult.severity,
        sentiment: aiVoiceResult.sentiment,
        sentiment_score: -0.85,
        keywords: aiVoiceResult.keywords,
        is_recurring: recurringResult.is_recurring,
        similarity_score: recurringResult.similarity_score,
        related_issue: recurringResult.related_issue,
        created_at: new Date()
      });
    }

    // 6. Recalculate customer features & unified risk
    const features = await buildCustomerFeatures(customerId, customer, loan);
    const riskResult = await aiService.analyzeCustomerRisk(customerId, features);

    // 7. Create/update RiskEvent
    await RiskEvent.create({
      event_id: generateId('RISK-EVT'),
      customer_id: customerId,
      risk_score: riskResult.current_risk.score,
      risk_level: riskResult.current_risk.level,
      default_probability: riskResult.future_default_probability,
      future_probability: riskResult.future_default_probability,
      trigger_event: 'VOICE_CALL_RECEIVED',
      event_type: 'VOICE_CALL_RECEIVED',
      important_risk_signals: riskResult.important_risk_signals || [],
      recommendations: riskResult.recommendations || [],
      features: {
        ...features,
        important_risk_signals: riskResult.important_risk_signals,
        recommendations: riskResult.recommendations
      },
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      customer_id: customerId,
      voice: {
        transcript: aiVoiceResult.transcript,
        language: aiVoiceResult.language,
        sentiment: aiVoiceResult.sentiment,
        category: aiVoiceResult.category,
        severity: aiVoiceResult.severity,
        keywords: aiVoiceResult.keywords,
        recurring: recurringResult
      },
      transcript: aiVoiceResult.transcript,
      language: aiVoiceResult.language,
      sentiment: aiVoiceResult.sentiment,
      category: aiVoiceResult.category,
      severity: aiVoiceResult.severity,
      keywords: aiVoiceResult.keywords,
      recurring_issue: recurringResult,
      risk: {
        risk_score: riskResult.current_risk.score,
        risk_level: riskResult.current_risk.level,
        default_probability: riskResult.future_default_probability,
        future_probability: riskResult.future_default_probability,
        important_risk_signals: riskResult.important_risk_signals || [],
        recommendations: riskResult.recommendations || []
      },
      recommendations: riskResult.recommendations || []
    });
  } catch (error) {
    logger.error(`Error in handleCustomerVoice: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error during voice processing'
    });
  }
};
