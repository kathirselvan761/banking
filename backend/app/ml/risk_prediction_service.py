import os
import json
import logging
from typing import Dict, Any, List
import numpy as np
from xgboost import XGBClassifier
from app.config.settings import settings

logger = logging.getLogger("banking_ai.risk_prediction")

FEATURE_COLUMNS: List[str] = [
    "credit_score",
    "monthly_income",
    "loan_amount",
    "monthly_emi",
    "outstanding_amount",
    "overdue_amount",
    "emi_delay_count",
    "previous_payment_delays",
    "complaint_count",
    "negative_sentiment_count",
    "transaction_count",
    "transaction_anomaly_count"
]

FEATURE_DEFAULTS: Dict[str, float] = {
    "credit_score": 650.0,
    "monthly_income": 50000.0,
    "loan_amount": 300000.0,
    "monthly_emi": 10000.0,
    "outstanding_amount": 250000.0,
    "overdue_amount": 0.0,
    "emi_delay_count": 0.0,
    "previous_payment_delays": 0.0,
    "complaint_count": 0.0,
    "negative_sentiment_count": 0.0,
    "transaction_count": 30.0,
    "transaction_anomaly_count": 0.0
}

MODEL_PATH = os.path.join(settings.MODEL_DIR, "xgboost_default_model.json")

class RiskPredictionService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = XGBClassifier()
                self.model.load_model(MODEL_PATH)
                logger.info(f"Loaded XGBoost default prediction model from {MODEL_PATH}")
            except Exception as e:
                logger.error(f"Failed to load XGBoost model: {e}")

    def extract_feature_vector(self, data: Dict[str, Any]) -> np.ndarray:
        values = []
        for col in FEATURE_COLUMNS:
            val = data.get(col, FEATURE_DEFAULTS.get(col, 0.0))
            if val is None:
                val = FEATURE_DEFAULTS.get(col, 0.0)
            values.append(float(val))
        return np.array([values])

    def predict_future_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predicts future loan default risk probability using XGBoost.
        The probability comes directly from XGBoost model (not invented by LLM).
        """
        X = self.extract_feature_vector(data)
        
        if self.model is not None:
            try:
                proba = float(self.model.predict_proba(X)[0][1])
                return {
                    "future_risk_probability": round(proba, 4),
                    "model_used": "XGBoost Classifier v2.0"
                }
            except Exception as e:
                logger.error(f"XGBoost inference error: {e}")

        # Statistical fallback if weights unavailable
        score = 0.15
        overdue = float(data.get("overdue_amount", 0))
        delays = float(data.get("emi_delay_count", 0))
        score += min(0.40, delays * 0.15)
        if overdue > 0:
            score += min(0.35, (overdue / 50000.0) * 0.25)
        return {
            "future_risk_probability": round(min(0.98, max(0.05, score)), 4),
            "model_used": "Statistical Fallback Risk Engine"
        }

risk_prediction_service = RiskPredictionService()
