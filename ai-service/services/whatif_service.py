"""
What-If Decision Intelligence Service
Evaluates counterfactual borrower risk scenarios using the trained XGBoost model.
Allows bank risk officers to simulate changes to safe, actionable risk factors.
"""

from typing import Dict, Any
import math
from models.prediction_model import prediction_model, get_risk_level

# Canonical allowed feature set for What-If scenario manipulation
ALLOWED_WHAT_IF_FEATURES = {
    "credit_score": {"min": 300, "max": 850, "type": (int, float), "label": "Credit Score"},
    "income": {"min": 0, "max": 10000000, "type": (int, float), "label": "Monthly Income"},
    "monthly_income": {"min": 0, "max": 10000000, "type": (int, float), "label": "Monthly Income"},
    "overdue_amount": {"min": 0, "max": 50000000, "type": (int, float), "label": "Overdue Amount"},
    "payment_delay_count": {"min": 0, "max": 120, "type": (int, float), "label": "Payment Delay Count"},
    "emi_delay_count": {"min": 0, "max": 120, "type": (int, float), "label": "Payment Delay Count"},
    "loan_amount": {"min": 0, "max": 100000000, "type": (int, float), "label": "Loan Principal Amount"},
    "monthly_emi": {"min": 0, "max": 10000000, "type": (int, float), "label": "Monthly EMI"},
    "complaint_count": {"min": 0, "max": 500, "type": (int, float), "label": "Complaint Count"},
    "negative_sentiment_count": {"min": 0, "max": 500, "type": (int, float), "label": "Negative Sentiment Count"},
}

def validate_scenario_features(changes: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates scenario changes against allowed variables, numerical validity,
    and acceptable business ranges.
    """
    if not isinstance(changes, dict) or len(changes) == 0:
        raise ValueError("Scenario changes must be a non-empty dictionary of feature changes.")

    validated = {}
    for key, val in changes.items():
        if key not in ALLOWED_WHAT_IF_FEATURES:
            raise ValueError(
                f"Feature '{key}' is not an allowed What-If scenario variable. "
                f"Allowed variables: {list(ALLOWED_WHAT_IF_FEATURES.keys())}"
            )

        # Validate numeric type
        if not isinstance(val, (int, float)) or isinstance(val, bool) or math.isnan(val) or math.isinf(val):
            raise ValueError(f"Feature '{key}' must be a valid finite number. Got: {val}")

        rules = ALLOWED_WHAT_IF_FEATURES[key]
        num_val = float(val)

        if num_val < rules["min"]:
            raise ValueError(
                f"Feature '{key}' value ({num_val}) cannot be less than {rules['min']}."
            )
        if rules.get("max") is not None and num_val > rules["max"]:
            raise ValueError(
                f"Feature '{key}' value ({num_val}) cannot exceed {rules['max']}."
            )

        validated[key] = int(num_val) if isinstance(val, int) else num_val

    return validated

def run_what_if(base_features: Dict[str, Any], modified_features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes a counterfactual What-If risk evaluation:
    1. Runs the existing XGBoost model using baseline features.
    2. Runs the existing XGBoost model using modified scenario features.
    3. Calculates probability delta, risk score delta, and direction.
    """
    if not isinstance(base_features, dict) or len(base_features) == 0:
        raise ValueError("Base features must be provided as a non-empty dictionary.")

    # Validate counterfactual scenario modifications
    validated_changes = validate_scenario_features(modified_features)

    # 1. Evaluate baseline prediction using existing XGBoost model
    original_res = prediction_model.predict_default_risk(base_features)
    original_prob = float(original_res["default_probability"])
    original_score = int(original_res["risk_score"])
    original_level = original_res["risk_level"]

    # 2. Merge scenario changes onto base features
    scenario_features = dict(base_features)
    for k, v in validated_changes.items():
        scenario_features[k] = v
        # Synchronize canonical aliases
        if k == "income":
            scenario_features["monthly_income"] = v
        elif k == "monthly_income":
            scenario_features["income"] = v
        elif k == "payment_delay_count":
            scenario_features["emi_delay_count"] = v
            scenario_features["previous_payment_delays"] = v
        elif k == "emi_delay_count":
            scenario_features["payment_delay_count"] = v
            scenario_features["previous_payment_delays"] = v

    # 3. Evaluate scenario prediction using existing XGBoost model
    scenario_res = prediction_model.predict_default_risk(scenario_features)
    scenario_prob = float(scenario_res["default_probability"])
    scenario_score = int(scenario_res["risk_score"])
    scenario_level = scenario_res["risk_level"]

    # 4. Calculate change in percentage points & direction
    percentage_points = scenario_score - original_score
    if percentage_points < 0:
        direction = "decreased"
    elif percentage_points > 0:
        direction = "increased"
    else:
        direction = "unchanged"

    return {
        "original": {
            "probability": original_prob,
            "risk_score": original_score,
            "risk_level": original_level,
        },
        "scenario": {
            "probability": scenario_prob,
            "risk_score": scenario_score,
            "risk_level": scenario_level,
        },
        "change": {
            "percentage_points": percentage_points,
            "direction": direction,
        },
        "modified_features": validated_changes,
    }

class WhatIfService:
    def __init__(self):
        self.allowed_features = ALLOWED_WHAT_IF_FEATURES

    def execute_scenario(self, base_features: Dict[str, Any], scenario_changes: Dict[str, Any]) -> Dict[str, Any]:
        return run_what_if(base_features, scenario_changes)

whatif_service = WhatIfService()
