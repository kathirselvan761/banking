import logging
from typing import Dict, Any, List

logger = logging.getLogger("banking_ai.risk_engine")

def get_risk_level_label(score: int) -> str:
    """Deterministic banking risk level mapping."""
    if score <= 25:
        return "Low"
    elif score <= 50:
        return "Medium"
    elif score <= 75:
        return "High"
    else:
        return "Critical"

class RiskEngine:
    """
    Deterministic rule-based risk scoring engine.
    Produces score (0-100) and Level (Low, Medium, High, Critical).
    """

    def calculate_current_risk(
        self,
        emi_delays: int = 0,
        overdue_amount: float = 0.0,
        monthly_emi: float = 10000.0,
        credit_utilization: float = 0.30,
        complaint_count: int = 0,
        has_negative_sentiment: bool = False,
        has_recurring_issue: bool = False,
        has_transaction_anomaly: bool = False,
        is_activity_declining: bool = False,
        credit_score: float = 700.0
    ) -> Dict[str, Any]:
        
        breakdown = []
        score = 10.0 # Baseline clean score

        # 1. EMI Delays (Weight: Up to 35 pts)
        if emi_delays > 0:
            delay_pts = min(35.0, emi_delays * 12.0)
            score += delay_pts
            breakdown.append({
                "signal": "EMI Payment Delays",
                "value": f"{emi_delays} missed payments",
                "points_added": delay_pts,
                "category": "DELINQUENCY"
            })

        # 2. Overdue Amount (Weight: Up to 25 pts)
        if overdue_amount > 0:
            overdue_ratio = overdue_amount / max(1.0, monthly_emi)
            overdue_pts = min(25.0, overdue_ratio * 10.0)
            score += overdue_pts
            breakdown.append({
                "signal": "Overdue Arrears",
                "value": f"₹{overdue_amount:,.2f} ({overdue_ratio:.1f}x EMI)",
                "points_added": round(overdue_pts, 1),
                "category": "ARREARS"
            })

        # 3. Credit Utilization (Weight: Up to 15 pts)
        if credit_utilization > 0.75:
            util_pts = 15.0
            score += util_pts
            breakdown.append({
                "signal": "High Credit Limit Utilization",
                "value": f"{round(credit_utilization * 100)}%",
                "points_added": util_pts,
                "category": "CREDIT"
            })
        elif credit_utilization > 0.50:
            util_pts = 8.0
            score += util_pts
            breakdown.append({
                "signal": "Moderate Credit Limit Utilization",
                "value": f"{round(credit_utilization * 100)}%",
                "points_added": util_pts,
                "category": "CREDIT"
            })

        # 4. Bureau Credit Score Deterioration (Weight: Up to 15 pts)
        if credit_score < 600:
            cs_pts = 15.0
            score += cs_pts
            breakdown.append({
                "signal": "Subprime Credit Score",
                "value": f"{int(credit_score)}",
                "points_added": cs_pts,
                "category": "CREDIT"
            })
        elif credit_score < 680:
            cs_pts = 7.0
            score += cs_pts
            breakdown.append({
                "signal": "Fair Credit Score",
                "value": f"{int(credit_score)}",
                "points_added": cs_pts,
                "category": "CREDIT"
            })

        # 5. Grievances & Sentiment (Weight: Up to 15 pts)
        if complaint_count > 0:
            comp_pts = min(10.0, complaint_count * 3.0)
            score += comp_pts
            breakdown.append({
                "signal": "Customer Disputes Filed",
                "value": f"{complaint_count} complaints",
                "points_added": comp_pts,
                "category": "COMPLAINT"
            })

        if has_negative_sentiment:
            score += 5.0
            breakdown.append({
                "signal": "Frustrated Negative Sentiment",
                "value": "Detected via FinBERT",
                "points_added": 5.0,
                "category": "SENTIMENT"
            })

        # 6. Recurring Issues (Weight: 10 pts)
        if has_recurring_issue:
            score += 10.0
            breakdown.append({
                "signal": "Repeated Service Disruption Pattern",
                "value": "Detected via SBERT semantic matching",
                "points_added": 10.0,
                "category": "RECURRING_ISSUE"
            })

        # 7. Transaction Anomalies (Weight: 10 pts)
        if has_transaction_anomaly:
            score += 10.0
            breakdown.append({
                "signal": "Unusual Transaction Outlier",
                "value": "Flagged by Isolation Forest",
                "points_added": 10.0,
                "category": "ANOMALY"
            })

        # 8. Declining Activity (Weight: 5 pts)
        if is_activity_declining:
            score += 5.0
            breakdown.append({
                "signal": "Dormancy / Activity Decline",
                "value": "Sudden drop in monthly transactions",
                "points_added": 5.0,
                "category": "BEHAVIOR"
            })

        final_score = int(min(100.0, max(0.0, round(score))))
        level = get_risk_level_label(final_score)

        return {
            "score": final_score,
            "level": level,
            "signals": breakdown,
            "is_critical": level == "Critical",
            "is_high_risk": level in ["High", "Critical"]
        }

risk_engine = RiskEngine()
