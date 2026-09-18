"""
Complaint & Customer Grievance NLP Analysis Service
Extracts sentiment, semantic category, keywords, severity, and key phrases.
"""

import re
from typing import Dict, Any, List
from services.sentiment_service import sentiment_service

CATEGORIES = [
    "PAYMENT_FAILURE",
    "LOAN_REPAYMENT",
    "ACCOUNT_ACCESS",
    "TRANSACTION_ISSUE",
    "CARD_ISSUE",
    "CUSTOMER_SERVICE",
    "FRAUD_SUSPICION",
    "OTHER"
]

CATEGORY_KEYWORDS = {
    "PAYMENT_FAILURE": [
        "emi", "installment", "payment", "failed", "failure", "bounced", "bounce", 
        "declined", "auto-debit", "autodebit", "mandate", "clearing"
    ],
    "LOAN_REPAYMENT": [
        "loan", "mortgage", "overdue", "restructure", "tenor", "interest", "penalty",
        "principal", "repayment", "grace", "moratorium", "foreclosure"
    ],
    "ACCOUNT_ACCESS": [
        "login", "password", "otp", "blocked", "freeze", "frozen", "locked", "credential",
        "portal", "app", "authenticator", "verification"
    ],
    "TRANSACTION_ISSUE": [
        "transaction", "wire", "transfer", "duplicate", "double", "charged", "settlement",
        "pending", "neft", "rtgs", "ach", "reversal"
    ],
    "CARD_ISSUE": [
        "card", "debit", "credit", "atm", "pin", "cvv", "swipe", "chip", "pos"
    ],
    "FRAUD_SUSPICION": [
        "fraud", "scam", "unauthorized", "stolen", "phishing", "suspicious", "hacked",
        "illegal", "police", "dispute"
    ],
    "CUSTOMER_SERVICE": [
        "support", "agent", "executive", "representative", "call", "ticket", "response",
        "unhelpful", "rude", "delayed", "manager", "resolution"
    ]
}

STOP_WORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "you", "your", "he", "she", "it",
    "they", "what", "which", "who", "whom", "this", "that", "these", "those", "am",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do",
    "does", "did", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once"
}

SEVERITY_TRIGGERS_CRITICAL = [
    "legal", "police", "court", "lawyer", "ombudsman", "fraud", "stolen", "ruined", "harassment"
]
SEVERITY_TRIGGERS_HIGH = [
    "failed twice", "failed again", "multiple times", "third time", "urgent", "critical",
    "penalty", "freeze", "immediately", "worst", "unresolved"
]

def extract_keywords(text: str, max_keywords: int = 6) -> List[str]:
    """Extracts significant keywords preserving banking acronyms like EMI."""
    # Find tokens preserving alphanumeric tokens and hyphens
    tokens = re.findall(r'\b[A-Za-z0-9\-_]+\b', text)
    extracted = []
    seen = set()

    for token in tokens:
        lower_token = token.lower()
        if lower_token not in STOP_WORDS and len(lower_token) > 2:
            if lower_token not in seen:
                seen.add(lower_token)
                # Keep uppercase for acronyms like EMI, ATM, OTP
                if token.upper() in ["EMI", "ATM", "OTP", "POS", "UPI", "NEFT", "RTGS", "ACH", "CVV"]:
                    extracted.append(token.upper())
                else:
                    extracted.append(token.lower())

    return extracted[:max_keywords]

def classify_category(text: str) -> str:
    """Classifies grievance into predefined banking categories via semantic keyword weighting."""
    cleaned = text.lower()
    scores = {cat: 0.0 for cat in CATEGORIES}

    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in cleaned:
                # Compound phrase matches get higher weight
                scores[cat] += 2.0 if " " in kw else 1.0

    best_cat = max(scores, key=scores.get)
    if scores[best_cat] == 0:
        return "OTHER"
    return best_cat

def determine_severity(text: str, sentiment_result: Dict[str, Any]) -> str:
    """Determines complaint severity level (low, medium, high, critical)."""
    cleaned = text.lower()
    neg_score = sentiment_result.get("negative_score", 0.5)

    for term in SEVERITY_TRIGGERS_CRITICAL:
        if term in cleaned:
            return "critical"

    for term in SEVERITY_TRIGGERS_HIGH:
        if term in cleaned:
            return "high"

    if neg_score >= 0.85:
        return "high"
    elif neg_score >= 0.50:
        return "medium"
    else:
        return "low"

class ComplaintService:
    def analyze_complaint(self, text: str) -> Dict[str, Any]:
        """
        Runs comprehensive NLP pipeline on complaint text:
        - Sentiment analysis
        - Category classification
        - Severity estimation
        - Keyword extraction
        """
        if not text or not text.strip():
            return {
                "category": "OTHER",
                "sentiment": "neutral",
                "severity": "low",
                "keywords": []
            }

        sentiment_res = sentiment_service.analyze_sentiment(text)
        category = classify_category(text)
        severity = determine_severity(text, sentiment_res)
        keywords = extract_keywords(text)

        return {
            "category": category,
            "sentiment": sentiment_res["sentiment"],
            "severity": severity,
            "keywords": keywords
        }

complaint_service = ComplaintService()
