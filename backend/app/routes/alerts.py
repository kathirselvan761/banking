from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from bson import ObjectId
from app.database.mongodb import get_collection

router = APIRouter(prefix="/api/alerts", tags=["Early Warning Alerts"])

@router.get("")
async def list_alerts(
    customer_id: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve early warning alerts prioritized by severity."""
    col = get_collection("alerts")
    query = {}
    if customer_id:
        query["customer_id"] = customer_id.upper()
    if severity:
        query["severity"] = severity.upper()

    cursor = col.find(query).sort([("severity", -1), ("created_at", -1)]).limit(limit)
    alerts = []
    for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        alerts.append(doc)

    return {
        "status": "SUCCESS",
        "count": len(alerts),
        "alerts": alerts,
        "data": alerts
    }

@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Mark an alert ticket as reviewed and resolved by a human banking officer."""
    col = get_collection("alerts")
    try:
        res = col.update_one(
            {"_id": ObjectId(alert_id)},
            {"$set": {"status": "RESOLVED", "resolved_by": "OFFICER_HUMAN"}}
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {"status": "SUCCESS", "message": f"Alert {alert_id} marked as resolved."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
