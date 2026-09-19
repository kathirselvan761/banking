from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.database.mongodb import get_collection
from app.ai.finbert_service import finbert_service
from app.ai.sbert_service import sbert_service

router = APIRouter(prefix="/api/complaints", tags=["Complaints & Recurring Issues"])

class SentimentAnalysisRequest(BaseModel):
    text: str

class RecurringCheckRequest(BaseModel):
    current_complaint: str
    previous_complaints: List[str]

@router.get("")
async def list_complaints(
    customer_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    """Retrieve logged complaints with sentiment flags."""
    query = {}
    if customer_id:
        query["customer_id"] = customer_id.upper()
    
    comps = list(get_collection("complaints").find(query, {"_id": 0}).sort("timestamp", -1).limit(limit))
    return {
        "status": "SUCCESS",
        "count": len(comps),
        "complaints": comps,
        "data": comps
    }

@router.post("/sentiment")
async def analyze_sentiment(payload: SentimentAnalysisRequest):
    """Direct FinBERT financial sentiment analysis."""
    res = finbert_service.analyze_sentiment(payload.text)
    return {
        "status": "SUCCESS",
        "sentiment": res
    }

@router.get("/recurring-clusters")
async def get_recurring_clusters():
    """
    Cluster all logged complaints across bank using Sentence-BERT embeddings.
    Identifies systemic recurring failure patterns.
    """
    comps = list(get_collection("complaints").find({}, {"_id": 0}))
    clusters = sbert_service.cluster_complaints(comps)
    return {
        "status": "SUCCESS",
        "cluster_count": len(clusters),
        "clusters": clusters
    }

@router.post("/recurring-check")
async def check_recurring(payload: RecurringCheckRequest):
    """Check single complaint against previous complaints for semantic similarity."""
    res = sbert_service.detect_recurring_issue(payload.current_complaint, payload.previous_complaints)
    return {
        "status": "SUCCESS",
        "recurring_analysis": res
    }
