"""
Recommendation Agent
Lightweight module orchestrating supervisory recommendations for relationship managers.
"""

from typing import Dict, Any, List
from services.recommendation_service import recommendation_service

class RecommendationAgent:
    def recommend(
        self,
        features: Dict[str, Any],
        risk_level: str = "LOW",
        anomalies_detected: bool = False
    ) -> List[Dict[str, str]]:
        """Invokes policy engine to generate mitigation actions."""
        return recommendation_service.generate_recommendations(
            features=features,
            risk_level=risk_level,
            anomalies_detected=anomalies_detected
        )

recommendation_agent = RecommendationAgent()
