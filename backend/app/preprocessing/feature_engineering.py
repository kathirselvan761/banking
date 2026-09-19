import re
from typing import Dict, Any

URGENT_KEYWORDS = [
    "fail", "fraud", "stolen", "unauthorized", "dispute", "penalty",
    "overdue", "blocked", "legal", "notice", "urgent", "harassment",
    "bounce", "charge", "refund", "deducted", "distress", "escalate"
]

def extract_text_features(text: str) -> Dict[str, Any]:
    """Extract urgency signals, length, and keyword flags from customer text."""
    lower_text = text.lower()
    matched_keywords = [kw for kw in URGENT_KEYWORDS if kw in lower_text]
    urgency_score = min(1.0, len(matched_keywords) * 0.25)
    
    has_financial_distress = any(k in lower_text for k in ["job loss", "medical", "cannot pay", "crisis", "default", "overdue", "penalty"])
    
    return {
        "text_length": len(text),
        "word_count": len(text.split()),
        "urgency_score": round(urgency_score, 2),
        "matched_keywords": matched_keywords,
        "financial_distress_flag": has_financial_distress
    }

def extract_financial_features(
    monthly_income: float,
    loan_amount: float,
    monthly_emi: float,
    outstanding_amount: float,
    overdue_amount: float,
    credit_limit: float = 200000.0
) -> Dict[str, Any]:
    """Derive key financial and credit risk ratios."""
    income = max(1000.0, float(monthly_income or 50000.0))
    principal = max(1000.0, float(loan_amount or 100000.0))
    limit = max(1000.0, float(credit_limit or 200000.0))
    
    # Ratios
    dti_ratio = round((monthly_emi / income), 4)
    credit_utilization = round(min(1.0, (outstanding_amount / limit)), 4)
    overdue_ratio = round(min(1.0, (overdue_amount / principal)), 4)
    emi_burden = "HIGH" if dti_ratio > 0.40 else ("MEDIUM" if dti_ratio > 0.25 else "LOW")
    
    return {
        "debt_to_income_ratio": dti_ratio,
        "credit_utilization": credit_utilization,
        "overdue_to_principal_ratio": overdue_ratio,
        "emi_burden_level": emi_burden
    }
