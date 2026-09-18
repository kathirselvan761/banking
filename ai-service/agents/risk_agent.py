"""
Risk Agent
Lightweight module coordinating XGBoost default prediction, SHAP explanations,
anomaly synthesis, sentiment summaries, and supervisory recommendations into a unified risk response.
"""

from typing import Dict, Any, List
from models.prediction_model import prediction_model
from agents.explanation_agent import explanation_agent
from agents.recommendation_agent import recommendation_agent

class RiskAgent:
    def evaluate_unified_risk(
        self,
        customer_id: str,
        features: Dict[str, Any],
        anomalies: List[Dict[str, Any]] = None,
        sentiment_summary: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end multi-signal evaluation:
        - XGBoost default risk scoring
        - SHAP feature attributions
        - Supervisory recommendations
        - Anomaly and sentiment roll-up
        """
        anomalies = anomalies or []
        sentiment_summary = sentiment_summary or {
            "negative_count": int(features.get("negative_sentiment_count", 0))
        }

        # 1. XGBoost Inference
        ml_result = prediction_model.predict_default_risk(features)
        prob = ml_result["default_probability"]
        score = ml_result["risk_score"]
        level = ml_result["risk_level"]

        # 2. SHAP Explanations
        signals = explanation_agent.explain(features, top_k=4)

        # 3. Recommendations
        anomalies_flag = len(anomalies) > 0 or int(features.get("transaction_anomaly_count", 0)) > 0
        recs = recommendation_agent.recommend(
            features=features,
            risk_level=level,
            anomalies_detected=anomalies_flag
        )

        return {
            "customer_id": customer_id,
            "current_risk": {
                "score": score,
                "level": level
            },
            "future_default_probability": prob,
            "anomalies": anomalies,
            "sentiment_summary": sentiment_summary,
            "important_risk_signals": signals,
            "recommendations": recs
        }

risk_agent = RiskAgent()
