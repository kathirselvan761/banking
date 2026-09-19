from typing import Dict, Any, List
from app.ai.finbert_service import finbert_service
from app.ai.sbert_service import sbert_service
from app.ml.anomaly_service import anomaly_service
from app.ml.segmentation_service import segmentation_service
from app.ml.risk_prediction_service import risk_prediction_service
from app.ml.shap_service import shap_service
from app.database.mongodb import get_collection

def run_sentiment_analysis(text: str) -> Dict[str, Any]:
    """Execute FinBERT sentiment analysis on grievance or communication text."""
    res = finbert_service.analyze_sentiment(text)
    return {
        "status": "SUCCESS",
        "tool": "run_sentiment_analysis",
        "result": res
    }

def find_similar_complaints(complaint_text: str, customer_id: str = None) -> Dict[str, Any]:
    """Execute SBERT semantic comparison across previous complaints to detect recurring issues."""
    col = get_collection("complaints")
    query = {}
    if customer_id:
        query["customer_id"] = customer_id
    historical = [c.get("description", c.get("text", "")) for c in col.find(query)]
    res = sbert_service.detect_recurring_issue(complaint_text, historical)
    return {
        "status": "SUCCESS",
        "tool": "find_similar_complaints",
        "result": res
    }

def run_transaction_anomaly(transaction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute Isolation Forest anomaly detection on transaction parameters."""
    res = anomaly_service.detect_anomaly(transaction_data)
    return {
        "status": "SUCCESS",
        "tool": "run_transaction_anomaly",
        "result": res
    }

def get_customer_segment(customer_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute K-Means customer segmentation to classify behavioral profile."""
    res = segmentation_service.segment_customer(customer_data)
    return {
        "status": "SUCCESS",
        "tool": "get_customer_segment",
        "result": res
    }

def predict_future_risk(features: Dict[str, Any]) -> Dict[str, Any]:
    """Execute XGBoost model to predict 90-day loan default risk probability."""
    res = risk_prediction_service.predict_future_risk(features)
    return {
        "status": "SUCCESS",
        "tool": "predict_future_risk",
        "result": res
    }

def get_shap_explanation(features: Dict[str, Any]) -> Dict[str, Any]:
    """Execute SHAP explainer to identify top contributing risk factors."""
    res = shap_service.explain(features)
    return {
        "status": "SUCCESS",
        "tool": "get_shap_explanation",
        "result": res
    }
