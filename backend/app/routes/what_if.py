from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.risk_profile_service import risk_profile_service
from app.tools.scenario_tools import run_what_if

router = APIRouter(prefix="/api/what-if", tags=["What-If Scenario Simulation"])

class WhatIfSimulationRequest(BaseModel):
    customer_id: str = Field(..., description="Customer ID e.g. C101")
    overdue_amount: Optional[float] = None
    emi_delay_count: Optional[int] = None
    credit_utilization: Optional[float] = None
    complaint_count: Optional[int] = None
    monthly_emi: Optional[float] = None
    credit_score: Optional[float] = None

@router.post("/simulate")
async def simulate_scenario(payload: WhatIfSimulationRequest):
    """
    Run interactive What-If scenario analysis:
    Recalculates risk with simulated parameters.
    Returns Current Risk, Scenario Risk, Difference, and Future Risk Probability.
    Clearly labeled as a model-based scenario estimate for decision support.
    """
    cid = payload.customer_id.upper()
    current_profile = risk_profile_service.build_common_risk_profile(cid)

    sim_params = {}
    if payload.overdue_amount is not None:
        sim_params["overdue_amount"] = payload.overdue_amount
    if payload.emi_delay_count is not None:
        sim_params["emi_delay_count"] = payload.emi_delay_count
    if payload.credit_utilization is not None:
        sim_params["credit_utilization"] = payload.credit_utilization
    if payload.complaint_count is not None:
        sim_params["complaint_count"] = payload.complaint_count
    if payload.monthly_emi is not None:
        sim_params["monthly_emi"] = payload.monthly_emi
    if payload.credit_score is not None:
        sim_params["credit_score"] = payload.credit_score

    result = run_what_if(current_profile, sim_params)
    return {
        "status": "SUCCESS",
        "simulation": result
    }

@router.get("/{customer_id}")
async def get_default_what_if(customer_id: str):
    """Retrieve precomputed restructuring scenario for customer."""
    cid = customer_id.upper()
    current_profile = risk_profile_service.build_common_risk_profile(cid)
    
    # Precomputed scenario: clear overdue amount
    sim_params = {
        "overdue_amount": 0.0,
        "emi_delay_count": max(0, int(current_profile.get("emi_delay_count", 0)) - 1)
    }
    result = run_what_if(current_profile, sim_params)
    return {
        "status": "SUCCESS",
        "simulation": result
    }
