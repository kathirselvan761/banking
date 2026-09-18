"""
Explainable AI (XAI) Service with SHAP
Calculates exact feature attributions for XGBoost default predictions.
"""

import os
from typing import Dict, Any, List, Union
import numpy as np
import pandas as pd
import shap

from services.feature_service import extract_features, FEATURE_COLUMNS
from models.prediction_model import prediction_model

explainer_instance = None

def get_explainer():
    """Initializes and caches shap.TreeExplainer on the trained XGBoost model."""
    global explainer_instance
    if explainer_instance is not None:
        return explainer_instance

    if not prediction_model.is_loaded or prediction_model.model is None:
        prediction_model._load_if_exists()

    if prediction_model.model is None:
        raise RuntimeError("Trained XGBoost model is not loaded for SHAP explanation.")

    try:
        explainer_instance = shap.TreeExplainer(prediction_model.model)
        print("[INFO] SHAP TreeExplainer initialized on XGBoost model.")
        return explainer_instance
    except Exception as e:
        print(f"[ERROR] Failed to initialize SHAP explainer: {e}")
        raise RuntimeError(f"SHAP TreeExplainer initialization failed: {str(e)}")

class ExplanationService:
    def explain_prediction(
        self,
        raw_features: Union[Dict[str, Any], pd.DataFrame],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Calculates exact SHAP values for a single customer risk instance.
        Returns a list of important risk signals formatted as:
        [
            {
                "feature": "overdue_amount",
                "impact": 0.31,
                "direction": "increases_risk"
            }
        ]
        """
        explainer = get_explainer()
        X = extract_features(raw_features)

        shap_values = explainer.shap_values(X)

        # In binary classification, shap_values is an array of shape (N, D) or list
        if isinstance(shap_values, list):
            sv = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
        elif len(shap_values.shape) == 2:
            sv = shap_values[0]
        else:
            sv = shap_values

        FEATURE_DISPLAY_NAMES = {
            "emi_delay_count": "payment_delay_count"
        }

        factors = []
        for feat_name, val in zip(FEATURE_COLUMNS, sv):
            impact_val = float(val)
            if abs(impact_val) >= 0.005:  # Filter out negligible noise
                direction = "increases_risk" if impact_val > 0 else "decreases_risk"
                display_name = FEATURE_DISPLAY_NAMES.get(feat_name, feat_name)
                factors.append({
                    "feature": display_name,
                    "impact": round(abs(impact_val), 2),
                    "direction": direction,
                    "raw_impact": round(impact_val, 4)
                })

        # Sort descending by impact magnitude
        factors.sort(key=lambda x: x["impact"], reverse=True)

        # Return sanitized dicts without internal raw_impact
        sanitized = [
            {
                "feature": f["feature"],
                "impact": f["impact"],
                "direction": f["direction"]
            }
            for f in factors[:top_k]
        ]

        return sanitized

explanation_service = ExplanationService()
