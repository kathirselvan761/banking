"""
Recommendation Engine Service
Generates actionable, non-autonomous supervisory recommendations based on risk signals.
"""

from typing import Dict, Any, List

class RecommendationService:
    def generate_recommendations(
        self,
        features: Dict[str, Any],
        risk_level: str = "LOW",
        anomalies_detected: bool = False
    ) -> List[Dict[str, str]]:
        """
        Synthesizes detected risk triggers into prioritized supervisory actions according to banking policy rules.
        """
        recs = []

        # Extract parameters supporting both alias conventions
        payment_delay_count = int(
            features.get("payment_delay_count", features.get("emi_delay_count", 0))
        )
        overdue_amount = float(features.get("overdue_amount", 0.0))
        complaint_count = int(
            features.get("complaint_count", features.get("recent_complaints_count", 0))
        )
        negative_sentiment_count = int(features.get("negative_sentiment_count", 0))
        sentiment_score = float(features.get("sentiment_score", 0.0))
        is_negative_sentiment_high = (
            negative_sentiment_count >= 1 or
            sentiment_score <= -0.5 or
            str(features.get("sentiment", "")).lower() == "negative"
        )
        
        anomaly_count = int(
            features.get("transaction_anomaly_count", features.get("unusual_transaction_count", 0))
        )
        is_anomaly = anomalies_detected or anomaly_count > 0 or bool(features.get("is_anomaly", False))

        signal_count = 0

        # Rule 1: IF payment_delay_count >= 2
        if payment_delay_count >= 2:
            signal_count += 1
            recs.append({
                "priority": "HIGH",
                "action": "Contact customer for early repayment assistance",
                "reason": "Multiple payment delays detected"
            })
        elif payment_delay_count == 1:
            signal_count += 1
            recs.append({
                "priority": "MEDIUM",
                "action": "Send reminder for upcoming installment",
                "reason": "Initial payment delay detected"
            })

        # Rule 2: IF overdue_amount > 0
        if overdue_amount > 0:
            signal_count += 1
            recs.append({
                "priority": "HIGH" if overdue_amount > 20000 else "MEDIUM",
                "action": "Review customer's repayment situation",
                "reason": f"Overdue repayment amount of {overdue_amount:,.0f} detected"
            })

        # Rule 3: IF complaint_count >= 2
        if complaint_count >= 2:
            signal_count += 1
            recs.append({
                "priority": "MEDIUM",
                "action": "Prioritize pending customer complaints",
                "reason": "Repeated complaints detected"
            })

        # Rule 4: IF negative sentiment is high
        if is_negative_sentiment_high:
            signal_count += 1
            recs.append({
                "priority": "MEDIUM",
                "action": "Schedule customer follow-up",
                "reason": "High negative sentiment detected"
            })

        # Rule 5: IF transaction anomaly is detected
        if is_anomaly:
            signal_count += 1
            recs.append({
                "priority": "MEDIUM",
                "action": "Review unusual transaction activity",
                "reason": "Unusual transaction spending or frequency anomaly detected"
            })

        # Rule 6: IF multiple risk signals exist
        if signal_count >= 2 or risk_level in ["HIGH", "CRITICAL"]:
            recs.append({
                "priority": "HIGH",
                "action": "Increase customer monitoring",
                "reason": f"Multiple compounding risk signals detected ({signal_count} active indicators)"
            })

        # Fallback if zero flags
        if not recs:
            recs.append({
                "priority": "LOW",
                "action": "Maintain standard quarterly account review",
                "reason": "Borrower metrics are healthy with zero active risk flags"
            })

        # Deduplicate recommendations by action while preserving highest priority
        unique_recs = []
        seen_actions = set()
        for r in recs:
            if r["action"] not in seen_actions:
                seen_actions.add(r["action"])
                unique_recs.append(r)

        # Sort priority: HIGH -> MEDIUM -> LOW
        priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        unique_recs.sort(key=lambda r: priority_order.get(r["priority"], 3))

        return unique_recs

recommendation_service = RecommendationService()
