import re
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger("banking_ai.cleaner")

def normalize_timestamp(ts: Optional[str]) -> str:
    """Ensure timestamp is formatted as standardized ISO-8601 UTC string."""
    if not ts:
        return datetime.now(timezone.utc).isoformat()
    try:
        # If timestamp is already valid isoformat
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.astimezone(timezone.utc).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()

def clean_text(text: Optional[str]) -> str:
    """Clean raw input text: strip HTML/tags, control chars, excessive whitespace."""
    if not text:
        return ""
    # Strip HTML tags
    cleaned = re.sub(r"<[^>]*>", " ", str(text))
    # Replace multiple whitespace/newlines with single space
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def clean_numeric(val: Any, default: float = 0.0, min_val: Optional[float] = None, max_val: Optional[float] = None) -> float:
    """Parse numeric values safely, impute defaults, and apply bounds."""
    try:
        if val is None:
            v = default
        else:
            v = float(val)
    except (ValueError, TypeError):
        v = default

    if min_val is not None and v < min_val:
        v = min_val
    if max_val is not None and v > max_val:
        v = max_val
    return v

def clean_email_payload(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Clean and validate email payload."""
    quality_log = {"missing_fields": [], "imputed": []}
    
    cleaned = {
        "customer_id": str(raw.get("customer_id", "")).strip().upper(),
        "sender": str(raw.get("sender", "")).strip().lower(),
        "subject": clean_text(raw.get("subject", "")),
        "body": clean_text(raw.get("body", "")),
        "timestamp": normalize_timestamp(raw.get("timestamp")),
        "source": "EMAIL"
    }
    
    if not cleaned["subject"]:
        quality_log["imputed"].append("subject")
        cleaned["subject"] = "Banking Query / Grievance"

    return cleaned, quality_log

def clean_feedback_payload(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Clean feedback/complaint payload."""
    quality_log = {"missing_fields": [], "imputed": []}
    
    cleaned = {
        "customer_id": str(raw.get("customer_id", "")).strip().upper(),
        "feedback_text": clean_text(raw.get("feedback_text", raw.get("text", raw.get("description", "")))),
        "channel": str(raw.get("channel", "PORTAL")).strip().upper(),
        "rating": clean_numeric(raw.get("rating"), default=3.0, min_val=1.0, max_val=5.0),
        "timestamp": normalize_timestamp(raw.get("timestamp")),
        "source": "CUSTOMER_FEEDBACK"
    }
    return cleaned, quality_log

def clean_transaction_payload(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Clean structured transaction data."""
    quality_log = {"missing_fields": [], "imputed": []}
    
    amount = clean_numeric(raw.get("amount"), default=0.0, min_val=0.0)
    cleaned = {
        "customer_id": str(raw.get("customer_id", "")).strip().upper(),
        "amount": amount,
        "type": str(raw.get("type", "DEBIT")).strip().upper(),
        "merchant": clean_text(raw.get("merchant", "General Merchant")),
        "category": str(raw.get("category", "General")).strip().title(),
        "channel": str(raw.get("channel", "UPI")).strip().upper(),
        "location": clean_text(raw.get("location", "Domestic")),
        "device_id": str(raw.get("device_id", "DEV-DEFAULT")).strip(),
        "timestamp": normalize_timestamp(raw.get("timestamp")),
        "source": "TRANSACTION"
    }
    return cleaned, quality_log

def clean_loan_payload(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Clean structured loan process data."""
    quality_log = {"missing_fields": [], "imputed": []}
    
    cleaned = {
        "customer_id": str(raw.get("customer_id", "")).strip().upper(),
        "loan_id": str(raw.get("loan_id", f"LN-{raw.get('customer_id', 'X')}")).strip(),
        "loan_type": str(raw.get("loan_type", "PERSONAL")).strip().upper(),
        "principal_amount": clean_numeric(raw.get("principal_amount", raw.get("loan_amount")), default=100000.0, min_val=1000.0),
        "monthly_emi": clean_numeric(raw.get("monthly_emi"), default=5000.0, min_val=100.0),
        "tenure_months": int(clean_numeric(raw.get("tenure_months"), default=36, min_val=1)),
        "outstanding_amount": clean_numeric(raw.get("outstanding_amount"), default=0.0, min_val=0.0),
        "overdue_amount": clean_numeric(raw.get("overdue_amount"), default=0.0, min_val=0.0),
        "emi_delay_count": int(clean_numeric(raw.get("emi_delay_count"), default=0, min_val=0)),
        "interest_rate": clean_numeric(raw.get("interest_rate"), default=10.5, min_val=1.0, max_val=40.0),
        "status": str(raw.get("status", "ACTIVE")).strip().upper(),
        "timestamp": normalize_timestamp(raw.get("timestamp")),
        "source": "LOAN_PROCESS"
    }
    return cleaned, quality_log

def clean_system_log_payload(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Clean system / operational logs."""
    quality_log = {"missing_fields": [], "imputed": []}
    
    cleaned = {
        "service_name": str(raw.get("service_name", "CORE_BANKING")).strip().upper(),
        "event_type": str(raw.get("event_type", "OPERATIONAL_EVENT")).strip().upper(),
        "severity": str(raw.get("severity", "WARN")).strip().upper(),
        "message": clean_text(raw.get("message", "System event logged")),
        "customer_id": str(raw.get("customer_id", "")).strip().upper() if raw.get("customer_id") else None,
        "metadata": raw.get("metadata", {}),
        "timestamp": normalize_timestamp(raw.get("timestamp")),
        "source": "SYSTEM_LOG"
    }
    return cleaned, quality_log
