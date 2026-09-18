"""
Explanation Agent
Lightweight module orchestrating SHAP explanations for customer risk signals.
"""

from typing import Dict, Any, List
from services.explanation_service import explanation_service

class ExplanationAgent:
    def explain(self, features: Dict[str, Any], top_k: int = 4) -> List[Dict[str, Any]]:
        """Invokes SHAP feature attribution on borrower features."""
        return explanation_service.explain_prediction(raw_features=features, top_k=top_k)

explanation_agent = ExplanationAgent()
