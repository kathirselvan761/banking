import mongoose from 'mongoose';

/**
 * Mongoose Schema for What-If Scenarios
 * Stores simulated borrower risk adjustments and model-predicted outcomes.
 */
const whatIfScenarioSchema = new mongoose.Schema({
  customer_id: {
    type: String,
    required: true,
    index: true,
  },
  base_features: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  scenario_changes: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  original_probability: {
    type: Number,
    required: true,
  },
  scenario_probability: {
    type: Number,
    required: true,
  },
  original_risk_score: {
    type: Number,
    required: true,
  },
  scenario_risk_score: {
    type: Number,
    required: true,
  },
  risk_change: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const WhatIfScenario = mongoose.model('WhatIfScenario', whatIfScenarioSchema);

export default WhatIfScenario;
