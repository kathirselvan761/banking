from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database.mongodb import get_collection
from app.services.risk_profile_service import risk_profile_service

router = APIRouter(prefix="/api/customers", tags=["Customer Management"])

@router.get("")
async def list_customers(
    limit: int = Query(50, ge=1, le=100),
    risk_level: Optional[str] = None
):
    """List customer directory with embedded real-time risk status."""
    cust_col = get_collection("customers")
    risk_col = get_collection("risk_profiles")

    customers = list(cust_col.find({}, {"_id": 0}).limit(limit))
    
    results = []
    for c in customers:
        cid = c.get("customer_id")
        rp = risk_col.find_one({"customer_id": cid}, {"_id": 0})
        if not rp:
            # Generate profile if not cached yet
            rp = risk_profile_service.build_common_risk_profile(cid)
        
        merged = {
            **c,
            "risk_score": rp.get("risk_score", 15),
            "risk_level": rp.get("risk_level", "Low"),
            "customer_segment": rp.get("customer_segment", "Stable Active Customer"),
            "future_risk_probability": rp.get("future_risk_probability", 0.12),
            "emi_delay_count": rp.get("emi_delay_count", 0),
            "overdue_amount": rp.get("overdue_amount", 0)
        }
        
        if risk_level and merged["risk_level"].upper() != risk_level.upper():
            continue
        results.append(merged)

    return {
        "status": "SUCCESS",
        "count": len(results),
        "customers": results,
        "data": results
    }

@router.get("/{customer_id}")
async def get_customer_details(customer_id: str):
    """Retrieve full customer profile, loans, recent transactions, complaints, and common risk profile."""
    cid = customer_id.upper()
    cust = get_collection("customers").find_one({"customer_id": cid}, {"_id": 0})
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer {cid} not found")

    loans = list(get_collection("loan_records").find({"customer_id": cid}, {"_id": 0}))
    transactions = list(get_collection("transactions").find({"customer_id": cid}, {"_id": 0}).sort("timestamp", -1).limit(15))
    complaints = list(get_collection("complaints").find({"customer_id": cid}, {"_id": 0}).sort("timestamp", -1))
    voice = list(get_collection("voice_records").find({"customer_id": cid}, {"_id": 0}).sort("timestamp", -1))
    
    risk_profile = risk_profile_service.build_common_risk_profile(cid)

    return {
        "status": "SUCCESS",
        "customer": cust,
        "loans": loans,
        "transactions": transactions,
        "complaints": complaints,
        "voice_records": voice,
        "risk_profile": risk_profile
    }
