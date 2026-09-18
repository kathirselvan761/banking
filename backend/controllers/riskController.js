import { aiClientService } from '../services/aiClientService.js';

/**
 * Early Warning Risk Intelligence Controller (Boilerplate Scaffolding)
 */

// GET /api/risks/alerts
export const getActiveAlerts = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: "Risk alerts endpoint ready. Will stream alerts from AI service."
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/risks/evaluate/:customerId
export const triggerRiskEvaluation = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const aiResponse = await aiClientService.evaluateRisk(customerId, req.body);
    res.status(200).json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    next(error);
  }
};
