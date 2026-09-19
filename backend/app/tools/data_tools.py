from typing import Dict, Any, List
from app.database.mongodb import get_collection

def get_customer_history(customer_id: str) -> Dict[str, Any]:
    """Retrieve full demographic, income, credit rating, and tenure history."""
    col = get_collection("customers")
    cust = col.find_one({"customer_id": customer_id}, {"_id": 0}) or {}
    return {
        "status": "SUCCESS",
        "customer_id": customer_id,
        "history": cust
    }

def get_transactions(customer_id: str, limit: int = 10) -> Dict[str, Any]:
    """Retrieve recent debit, credit, transfer, and UPI transactions."""
    col = get_collection("transactions")
    txs = list(col.find({"customer_id": customer_id}, {"_id": 0}).sort("timestamp", -1).limit(limit))
    return {
        "status": "SUCCESS",
        "customer_id": customer_id,
        "count": len(txs),
        "transactions": txs
    }

def get_complaints(customer_id: str) -> Dict[str, Any]:
    """Retrieve all logged disputes, grievance tickets, and resolution history."""
    col = get_collection("complaints")
    complaints = list(col.find({"customer_id": customer_id}, {"_id": 0}).sort("timestamp", -1))
    return {
        "status": "SUCCESS",
        "customer_id": customer_id,
        "count": len(complaints),
        "complaints": complaints
    }

def get_loan_history(customer_id: str) -> Dict[str, Any]:
    """Retrieve active and historical loans, EMI schedules, arrears, and delay counts."""
    col = get_collection("loan_records")
    loans = list(col.find({"customer_id": customer_id}, {"_id": 0}))
    return {
        "status": "SUCCESS",
        "customer_id": customer_id,
        "count": len(loans),
        "loan_records": loans
    }

def get_system_events(customer_id: str) -> Dict[str, Any]:
    """Retrieve operational backend logs, payment gateway timeouts, or system failures affecting customer."""
    col = get_collection("system_events")
    events = list(col.find({"$or": [{"customer_id": customer_id}, {"customer_id": None}]}, {"_id": 0}).sort("timestamp", -1).limit(10))
    return {
        "status": "SUCCESS",
        "customer_id": customer_id,
        "count": len(events),
        "events": events
    }

def get_related_incidents(category: str = "PAYMENT_FAILURE") -> Dict[str, Any]:
    """Retrieve similar banking incidents across the institution for trend correlation."""
    col = get_collection("system_events")
    incidents = list(col.find({"event_type": category}, {"_id": 0}).sort("timestamp", -1).limit(5))
    return {
        "status": "SUCCESS",
        "category": category,
        "count": len(incidents),
        "incidents": incidents
    }
