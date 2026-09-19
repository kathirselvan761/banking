from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.database.mongodb import get_collection
from app.services.risk_profile_service import risk_profile_service
from app.agents.graph import run_agentic_investigation

router = APIRouter(prefix="/api/investigation", tags=["Agentic AI Investigation Loop"])

@router.post("/run/{customer_id}")
async def run_investigation(customer_id: str):
    """
    Triggers the LangGraph Agentic AI Loop with tool calls for the customer.
    Executes:
    Monitoring Agent -> Investigation Agent (Tool Calling Loop) -> RCA Agent ->
    Prediction Agent (XGBoost) -> Explainability Agent (SHAP) -> Recommendation Agent ->
    What-If Agent -> Decision & Alert Agent.
    Saves and returns full Decision Intelligence output with audit trail.
    """
    cid = customer_id.upper()
    cust = get_collection("customers").find_one({"customer_id": cid})
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer {cid} not found")

    # 1. Fetch Common Risk Profile
    profile = risk_profile_service.build_common_risk_profile(cid)

    # 2. Execute LangGraph Agent Loop
    decision_intelligence = run_agentic_investigation(cid, profile)
    decision_intelligence["investigated_at"] = datetime.now(timezone.utc).isoformat()

    # 3. Persist in investigations collection
    try:
        get_collection("investigations").update_one(
            {"customer_id": cid},
            {"$set": decision_intelligence},
            upsert=True
        )
    except Exception as e:
        pass

    return {
        "status": "SUCCESS",
        "message": f"Agentic AI investigation loop completed for {cid}.",
        "decision_intelligence": decision_intelligence
    }

@router.get("/{customer_id}")
async def get_investigation_trail(customer_id: str):
    """Retrieve the latest agent investigation trail and decision intelligence for a customer."""
    cid = customer_id.upper()
    doc = get_collection("investigations").find_one({"customer_id": cid}, {"_id": 0})
    
    if not doc:
        # Run fresh investigation if none exists
        profile = risk_profile_service.build_common_risk_profile(cid)
        doc = run_agentic_investigation(cid, profile)
        doc["investigated_at"] = datetime.now(timezone.utc).isoformat()
        try:
            get_collection("investigations").update_one(
                {"customer_id": cid},
                {"$set": doc},
                upsert=True
            )
        except Exception:
            pass

    return {
        "status": "SUCCESS",
        "customer_id": cid,
        "decision_intelligence": doc
    }
