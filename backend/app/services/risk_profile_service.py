import logging
from typing import Dict, Any, Optional
from app.database.mongodb import get_collection
from app.ai.finbert_service import finbert_service
from app.ai.sbert_service import sbert_service
from app.ml.anomaly_service import anomaly_service
from app.ml.segmentation_service import segmentation_service
from app.ml.risk_prediction_service import risk_prediction_service
from app.ml.shap_service import shap_service
from app.ml.risk_engine import risk_engine

logger = logging.getLogger("banking_ai.risk_profile_service")

class RiskProfileService:
    def build_common_risk_profile(self, customer_id: str) -> Dict[str, Any]:
        """
        Builds the unified Common Risk Profile bridging ML models and Agentic AI.
        Combines:
        - Sentiment (FinBERT)
        - Recurring issues (Sentence-BERT)
        - Transaction anomalies (Isolation Forest)
        - Customer segment (K-Means)
        - Financial attributes (delays, overdue, utilization)
        - Deterministic current risk score & level (RiskEngine)
        - Future risk probability (XGBoost)
        - Explainability factors (SHAP)
        """
        db_cust = get_collection("customers").find_one({"customer_id": customer_id}) or {}
        db_loans = list(get_collection("loan_records").find({"customer_id": customer_id}))
        db_txs = list(get_collection("transactions").find({"customer_id": customer_id}).sort("timestamp", -1).limit(20))
        db_comps = list(get_collection("complaints").find({"customer_id": customer_id}))
        db_voice = list(get_collection("voice_records").find({"customer_id": customer_id}).sort("timestamp", -1).limit(5))

        # Financial parameters
        income = float(db_cust.get("monthly_income", 50000.0))
        credit_score = float(db_cust.get("credit_score", 650.0))

        # Loan aggregates
        total_loan_amount = sum(float(l.get("principal_amount", l.get("loan_amount", 0))) for l in db_loans) or 300000.0
        total_emi = sum(float(l.get("monthly_emi", 0)) for l in db_loans) or 10000.0
        total_outstanding = sum(float(l.get("outstanding_amount", 0)) for l in db_loans) or 220000.0
        total_overdue = sum(float(l.get("overdue_amount", 0)) for l in db_loans)
        max_delays = max([int(l.get("emi_delay_count", 0)) for l in db_loans] + [0])

        credit_limit = float(db_cust.get("credit_limit", 200000.0))
        credit_utilization = round(min(1.0, total_outstanding / max(1.0, credit_limit)), 4)

        # 1. NLP - Sentiment Analysis via FinBERT
        all_texts = []
        for c in db_comps:
            all_texts.append(c.get("description", c.get("text", "")))
        for v in db_voice:
            all_texts.append(v.get("transcript", ""))

        combined_text = " ".join([t for t in all_texts if t])
        sentiment_res = finbert_service.analyze_sentiment(combined_text)

        # 2. NLP - Recurring Issues via Sentence-BERT
        recurring_res = {"detected": False, "similarity_score": 0.0}
        if len(all_texts) >= 2:
            recurring_res = sbert_service.detect_recurring_issue(all_texts[0], all_texts[1:])
        elif len(all_texts) == 1:
            # Compare against system common complaint patterns
            system_complaints = [
                "UPI payment failed and amount deducted from savings account",
                "EMI debited twice but loan balance not updated",
                "Penalty charges applied unfairly after server maintenance"
            ]
            recurring_res = sbert_service.detect_recurring_issue(all_texts[0], system_complaints)

        # 3. ML - Transaction Anomaly via Isolation Forest
        anomaly_res = {"is_anomaly": False, "score": 0.25}
        if db_txs:
            latest_tx = db_txs[0]
            anomaly_res = anomaly_service.detect_anomaly({
                "amount": latest_tx.get("amount", 1000.0),
                "transaction_count": len(db_txs),
                "hour_of_day": latest_tx.get("hour_of_day", 14),
                "location_frequency": latest_tx.get("location_frequency", 5),
                "device_frequency": latest_tx.get("device_frequency", 10)
            })

        # 4. ML - Customer Segmentation via K-Means
        seg_res = segmentation_service.segment_customer({
            "monthly_income": income,
            "credit_score": credit_score,
            "loan_amount": total_loan_amount,
            "monthly_emi": total_emi,
            "transaction_count": len(db_txs),
            "credit_utilization": credit_utilization,
            "emi_delay_count": max_delays,
            "complaint_count": len(db_comps)
        })

        # 5. ML - Future Risk Prediction via XGBoost
        xgb_input = {
            "credit_score": credit_score,
            "monthly_income": income,
            "loan_amount": total_loan_amount,
            "monthly_emi": total_emi,
            "outstanding_amount": total_outstanding,
            "overdue_amount": total_overdue,
            "emi_delay_count": max_delays,
            "previous_payment_delays": max_delays,
            "complaint_count": len(db_comps),
            "negative_sentiment_count": 1 if sentiment_res["sentiment"] == "negative" else 0,
            "transaction_count": len(db_txs),
            "transaction_anomaly_count": 1 if anomaly_res["is_anomaly"] else 0
        }
        xgb_res = risk_prediction_service.predict_future_risk(xgb_input)
        future_risk_prob = xgb_res["future_risk_probability"]

        # 6. ML - SHAP Explainability
        shap_res = shap_service.explain(xgb_input)

        # 7. Current Risk Engine - Deterministic Scoring
        current_risk_res = risk_engine.calculate_current_risk(
            emi_delays=max_delays,
            overdue_amount=total_overdue,
            monthly_emi=total_emi,
            credit_utilization=credit_utilization,
            complaint_count=len(db_comps),
            has_negative_sentiment=sentiment_res["sentiment"] == "negative",
            has_recurring_issue=recurring_res["detected"],
            has_transaction_anomaly=anomaly_res["is_anomaly"],
            is_activity_declining=len(db_txs) < 5,
            credit_score=credit_score
        )

        # Standardized Common Risk Profile
        profile = {
            "customer_id": customer_id,
            "customer_name": db_cust.get("name", f"Customer {customer_id}"),
            "sentiment": {
                "label": sentiment_res["sentiment"],
                "confidence": sentiment_res["confidence"]
            },
            "recurring_issue": {
                "detected": recurring_res["detected"],
                "similarity_score": recurring_res["similarity_score"]
            },
            "transaction_anomaly": {
                "is_anomaly": anomaly_res["is_anomaly"],
                "score": anomaly_res.get("anomaly_score", 0.0)
            },
            "customer_segment": seg_res["segment_name"],
            "segment_cluster_id": seg_res["cluster_id"],
            "emi_delay_count": max_delays,
            "overdue_amount": total_overdue,
            "credit_utilization": credit_utilization,
            "complaint_count": len(db_comps),
            "risk_score": current_risk_res["score"],
            "risk_level": current_risk_res["level"],
            "future_risk_probability": future_risk_prob,
            "shap_factors": shap_res["top_factors"],
            "shap_explanations": shap_res["human_explanations"],
            "financial_summary": {
                "monthly_income": income,
                "credit_score": credit_score,
                "total_loan_amount": total_loan_amount,
                "monthly_emi": total_emi,
                "outstanding_amount": total_outstanding
            }
        }

        # Cache or update risk_profiles collection
        try:
            get_collection("risk_profiles").update_one(
                {"customer_id": customer_id},
                {"$set": profile},
                upsert=True
            )
        except Exception as e:
            logger.warning(f"Could not persist risk profile: {e}")

        return profile

risk_profile_service = RiskProfileService()
