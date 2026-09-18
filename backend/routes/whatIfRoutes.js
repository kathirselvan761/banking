import express from 'express';
import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import WhatIfScenario from '../models/WhatIfScenario.js';
import { buildCustomerFeatures } from '../services/featureService.js';
import { aiService } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/what-if/default-risk
 * Runs counterfactual What-If scenario simulation without modifying customer database state.
 */
router.post('/default-risk', async (req, res) => {
  try {
    const { customer_id, scenario_changes, base_features } = req.body;

    // 1. Validate customer ID & scenario changes
    if (!customer_id || typeof customer_id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid customer_id string is required.',
      });
    }

    if (!scenario_changes || typeof scenario_changes !== 'object' || Object.keys(scenario_changes).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'scenario_changes must be a non-empty object containing variable adjustments.',
      });
    }

    // 2. Load customer data from MongoDB
    const customer = await Customer.findOne({ customer_id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer ${customer_id} not found in banking database.`,
      });
    }

    // 3. Load active loan data from MongoDB
    const loan =
      (await Loan.findOne({
        customer_id,
        loan_status: { $in: ['CURRENT', 'WATCHLIST', 'DELINQUENT'] },
      })) || (await Loan.findOne({ customer_id }));

    // 4. Build current baseline features using existing feature service
    let currentBaseFeatures = await buildCustomerFeatures(customer_id, customer, loan);

    // If explicit base_features were passed by client, merge them safely
    if (base_features && typeof base_features === 'object') {
      currentBaseFeatures = { ...currentBaseFeatures, ...base_features };
    }

    // 5. Send request to FastAPI What-If endpoint
    const result = await aiService.runWhatIf(customer_id, currentBaseFeatures, scenario_changes);

    // 6. Save What-If scenario in MongoDB for audit history
    const scenarioDoc = await WhatIfScenario.create({
      customer_id,
      base_features: currentBaseFeatures,
      scenario_changes,
      original_probability: result.original.probability,
      scenario_probability: result.scenario.probability,
      original_risk_score: result.original.risk_score,
      scenario_risk_score: result.scenario.risk_score,
      risk_change: result.change,
      created_at: new Date(),
    });

    logger.info(`What-If scenario evaluated for ${customer_id}: ${result.original.risk_score} -> ${result.scenario.risk_score} (${result.change.percentage_points} pts)`);

    // 7. Return the result to frontend (purely a simulation; MongoDB customer data is UNTOUCHED)
    return res.status(200).json({
      success: true,
      customer_id,
      original: result.original,
      scenario: result.scenario,
      change: result.change,
      modified_features: result.modified_features,
      scenario_id: scenarioDoc._id,
      created_at: scenarioDoc.created_at,
    });
  } catch (error) {
    logger.error(`Error in /api/what-if/default-risk: ${error.message}`);
    const statusCode = error.message.includes('not an allowed') || error.message.includes('must be a valid') ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Error executing What-If scenario simulation',
    });
  }
});

/**
 * GET /api/what-if/:customerId
 * Retrieves historical What-If scenario evaluations for an account
 */
router.get('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const history = await WhatIfScenario.find({ customer_id: customerId })
      .sort({ created_at: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      customer_id: customerId,
      count: history.length,
      data: history,
    });
  } catch (error) {
    logger.error(`Error in GET /api/what-if/:customerId: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching What-If scenario history',
    });
  }
});

export default router;
