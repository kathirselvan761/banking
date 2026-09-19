from typing import Dict, Any, List
from datetime import datetime, timezone
from app.database.mongodb import get_collection

def create_alert(
    customer_id: str,
    severity: str,
    title: str,
    reason: str,
    evidence: List[Dict[str, Any]],
    recommended_action: str
) -> Dict[str, Any]:
    """Persist an early warning alert ticket in MongoDB for human loan officer review."""
    col = get_collection("alerts")
    alert_doc = {
        "customer_id": customer_id,
        "severity": severity.upper(),
        "title": title,
        "reason": reason,
        "evidence": evidence,
        "recommended_action": recommended_action,
        "status": "OPEN",
        "requires_human_review": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = col.insert_one(alert_doc)
    alert_doc["_id"] = str(res.inserted_id)
    return {
        "status": "SUCCESS",
        "tool": "create_alert",
        "alert_id": str(res.inserted_id),
        "alert": alert_doc
    }

def get_risk_summary() -> Dict[str, Any]:
    """Compile global portfolio distribution counts and key statistics across all banking customers."""
    cust_col = get_collection("customers")
    risk_col = get_collection("risk_profiles")
    alert_col = get_collection("alerts")
    tx_col = get_collection("transactions")
    comp_col = get_collection("complaints")

    total_customers = cust_col.count_documents({})
    profiles = list(risk_col.find({}, {"_id": 0}))

    low = sum(1 for p in profiles if p.get("risk_level") == "Low")
    med = sum(1 for p in profiles if p.get("risk_level") == "Medium")
    high = sum(1 for p in profiles if p.get("risk_level") == "High")
    critical = sum(1 for p in profiles if p.get("risk_level") == "Critical")

    avg_score = round(sum(p.get("risk_score", 0) for p in profiles) / max(1, len(profiles)), 1)
    active_alerts = alert_col.count_documents({"status": "OPEN"})

    return {
        "status": "SUCCESS",
        "total_customers": total_customers,
        "risk_distribution": {
            "low": low,
            "medium": med,
            "high": high,
            "critical": critical
        },
        "average_risk_score": avg_score,
        "active_alerts_count": active_alerts
    }
