from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.database.mongodb import get_collection
from app.ml.anomaly_service import anomaly_service

router = APIRouter(prefix="/api/transactions", tags=["Transactions & Anomaly Detection"])

class AnomalyCheckRequest(BaseModel):
    amount: float
    transaction_count: Optional[int] = 5
    hour_of_day: Optional[int] = 12
    location_frequency: Optional[int] = 1
    device_frequency: Optional[int] = 1

@router.get("")
async def list_transactions(
    customer_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    """List transactions with anomaly indicator."""
    query = {}
    if customer_id:
        query["customer_id"] = customer_id.upper()
    
    txs = list(get_collection("transactions").find(query, {"_id": 0}).sort("timestamp", -1).limit(limit))
    return {
        "status": "SUCCESS",
        "count": len(txs),
        "transactions": txs,
        "data": txs
    }

@router.post("/anomaly-check")
async def check_transaction_anomaly(payload: AnomalyCheckRequest):
    """
    Direct endpoint to evaluate Isolation Forest transaction anomaly score.
    Returns anomaly score, flag, and statistical interpretation.
    """
    res = anomaly_service.detect_anomaly(payload.model_dump())
    return {
        "status": "SUCCESS",
        "result": res
    }
