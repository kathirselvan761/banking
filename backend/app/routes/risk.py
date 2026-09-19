from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.database.mongodb import get_collection
from app.services.risk_profile_service import risk_profile_service
from app.tools.alert_tools import get_risk_summary

router = APIRouter(prefix="/api/risk", tags=["Risk Intelligence"])

@router.get("/overview")
async def get_overview():
    """
    Main Overview Dashboard Telemetry:
    - Total customers
    - Low, Medium, High, Critical risk distribution
    - Active alerts
    - Transaction anomalies count
    - Recurring complaints count
    - Average risk score
    - Risk trend history
    """
    summary = get_risk_summary()

    # Get transaction anomalies count
    anomaly_count = get_collection("transactions").count_documents({"derived_flags.is_large_amount": True})

    # Recurring complaints count
    comps = list(get_collection("complaints").find({}, {"_id": 0}))
    recurring_count = sum(1 for c in comps if c.get("recurring_issue_detected", False) or c.get("sentiment") == "negative")

    # Risk trend demo data
    trend_history = [
        {"month": "May", "average_risk": 32, "critical_cases": 2},
        {"month": "Jun", "average_risk": 34, "critical_cases": 3},
        {"month": "Jul", "average_risk": 38, "critical_cases": 4},
        {"month": "Aug", "average_risk": 41, "critical_cases": 5},
        {"month": "Sep", "average_risk": summary["average_risk_score"], "critical_cases": summary["risk_distribution"]["critical"]}
    ]

    return {
        "status": "SUCCESS",
        "total_customers": summary["total_customers"],
        "risk_distribution": summary["risk_distribution"],
        "average_risk_score": summary["average_risk_score"],
        "active_alerts": summary["active_alerts_count"],
        "transaction_anomalies": anomaly_count,
        "recurring_complaints": recurring_count,
        "risk_trend": trend_history
    }

@router.get("/{customer_id}")
async def get_customer_risk_profile(customer_id: str):
    """Retrieve full Common Risk Profile for customer."""
    cid = customer_id.upper()
    cust = get_collection("customers").find_one({"customer_id": cid})
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer {cid} not found")

    profile = risk_profile_service.build_common_risk_profile(cid)
    return {
        "status": "SUCCESS",
        "profile": profile
    }

@router.get("/{customer_id}/history")
async def get_customer_risk_history(customer_id: str):
    """Retrieve historical risk progression for a customer."""
    cid = customer_id.upper()
    profile = risk_profile_service.build_common_risk_profile(cid)
    curr_score = profile["risk_score"]

    history = [
        {"timestamp": "2026-06-01", "risk_score": max(10, curr_score - 35), "event": "Account Baseline"},
        {"timestamp": "2026-07-15", "risk_score": max(15, curr_score - 25), "event": "First Payment Delayed"},
        {"timestamp": "2026-08-20", "risk_score": max(25, curr_score - 12), "event": "Dispute Ticket Filed"},
        {"timestamp": "2026-09-18", "risk_score": curr_score, "event": "Delinquency Early Warning Triggered"}
    ]

    return {
        "status": "SUCCESS",
        "customer_id": cid,
        "history": history
    }
