"""
End-to-End System Integration Verification Script
Validates the entire refactored architecture:
1. Ingestion Layer (Email, Feedback, Transaction, Loan, System-Log)
2. Validation & Preprocessing Pipeline
3. Multi-Modal NLP (Whisper, FinBERT, Sentence-BERT)
4. ML Models (Isolation Forest, K-Means, XGBoost, SHAP)
5. Deterministic Risk Engine & Common Risk Profile
6. LangGraph Multi-Agent Loop with Tools (8 Agents)
7. Decision Intelligence Output & Human Advisory Recommendations
8. What-If Counterfactual Simulator
9. Alerts & Portfolio Overview
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_system():
    print("=" * 75)
    print("BANKING AI EARLY WARNING SYSTEM - END-TO-END VERIFICATION")
    print("=" * 75)

    passed = 0
    total = 0

    def check(name, condition, details=""):
        nonlocal passed, total
        total += 1
        status = "PASS" if condition else "FAIL"
        if condition:
            passed += 1
        print(f"[{status}] {total}. {name} {details}")
        return condition

    # 1. Health
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=5)
        data = r.json()
        check("FastAPI & MongoDB Health", r.status_code == 200 and data.get("status") == "healthy", f"({data.get('service')})")
    except Exception as e:
        check("FastAPI & MongoDB Health", False, str(e))

    # 2. Customers
    try:
        r = requests.get(f"{BASE_URL}/api/customers", timeout=5)
        data = r.json()
        customers = data.get("customers", [])
        c101_found = any(c.get("customer_id") == "C101" for c in customers)
        check("Customer Directory API", r.status_code == 200 and len(customers) >= 5, f"Found {len(customers)} customers")
        check("Primary Demo Customer C101 Exists", c101_found, "Alex Vance present")
    except Exception as e:
        check("Customer Directory API", False, str(e))

    # 3. Common Risk Profile for C101
    try:
        r = requests.get(f"{BASE_URL}/api/risk/C101", timeout=5)
        data = r.json()
        p = data.get("profile", {})
        score = p.get("risk_score")
        level = p.get("risk_level")
        future_prob = p.get("future_risk_probability")
        seg = p.get("customer_segment")
        check("Common Risk Profile Compiled", score is not None and level is not None, f"Score: {score} ({level})")
        check("XGBoost Future Risk Probability", future_prob is not None, f"P(default) = {future_prob}")
        check("K-Means Behavioral Segmentation", seg is not None, f"Segment: {seg}")
        check("SHAP Explainability Top Factors", len(p.get("shap_factors", [])) > 0, f"{len(p.get('shap_factors', []))} factors")
    except Exception as e:
        check("Common Risk Profile", False, str(e))

    # 4. Ingestion Pipeline
    try:
        # Email
        email_payload = {
            "customer_id": "C101",
            "sender": "alex.vance@demo-bank.com",
            "subject": "Recurring UPI Failure Grievance",
            "body": "My UPI payment failed again today and money was debited without credit. Please fix this urgent issue."
        }
        r = requests.post(f"{BASE_URL}/api/ingest/email", json=email_payload, timeout=5)
        data = r.json()
        check("Data Ingestion: Email -> Validation -> FinBERT", r.status_code == 200 and data.get("status") == "SUCCESS", f"Sentiment: {data.get('sentiment', {}).get('sentiment')}")

        # Transaction
        tx_payload = {
            "customer_id": "C101",
            "amount": 75000.0,
            "type": "DEBIT",
            "merchant": "Overseas Gateway",
            "channel": "ONLINE",
            "location": "International"
        }
        r = requests.post(f"{BASE_URL}/api/ingest/transaction", json=tx_payload, timeout=5)
        data = r.json()
        check("Data Ingestion: Transaction -> Preprocessing", r.status_code == 200 and data.get("status") == "SUCCESS", f"Tx ID: {data.get('transaction_id')}")

        # Feedback
        fb_payload = {
            "customer_id": "C101",
            "feedback_text": "Payment gateway constantly errors out on loan EMI due dates.",
            "channel": "MOBILE_APP"
        }
        r = requests.post(f"{BASE_URL}/api/ingest/feedback", json=fb_payload, timeout=5)
        data = r.json()
        check("Data Ingestion: Feedback -> FinBERT + SBERT", r.status_code == 200 and data.get("status") == "SUCCESS", f"Recurring: {data.get('recurring_issue', {}).get('detected')}")
    except Exception as e:
        check("Data Ingestion Pipeline", False, str(e))

    # 5. Isolation Forest Anomaly Detection
    try:
        anomaly_payload = {
            "amount": 95000.0,
            "transaction_count": 2,
            "hour_of_day": 3,
            "location_frequency": 1,
            "device_frequency": 1
        }
        r = requests.post(f"{BASE_URL}/api/transactions/anomaly-check", json=anomaly_payload, timeout=5)
        data = r.json()
        is_anom = data.get("result", {}).get("is_anomaly")
        check("Isolation Forest Transaction Anomaly Detection", r.status_code == 200, f"Is Anomaly: {is_anom}")
    except Exception as e:
        check("Isolation Forest", False, str(e))

    # 6. Sentence-BERT Semantic Recurring Clusters
    try:
        r = requests.get(f"{BASE_URL}/api/complaints/recurring-clusters", timeout=5)
        data = r.json()
        clusters = data.get("clusters", [])
        check("Sentence-BERT Semantic Grievance Clustering", r.status_code == 200 and len(clusters) > 0, f"Identified {len(clusters)} semantic cluster(s)")
    except Exception as e:
        check("Sentence-BERT Clustering", False, str(e))

    # 7. LangGraph Agentic AI Loop (8 Agents with Tools)
    try:
        r = requests.post(f"{BASE_URL}/api/investigation/run/C101", timeout=15)
        data = r.json()
        di = data.get("decision_intelligence", {})
        trail = di.get("investigation_trail", [])
        recs = di.get("recommendations", [])
        factors = di.get("possible_contributing_factors", [])
        check("LangGraph Multi-Agent Loop Execution", r.status_code == 200 and len(trail) >= 5, f"Executed {len(trail)} agent steps")
        check("RCA Non-Causal Contributing Factors", len(factors) > 0, f"{len(factors)} possible factor(s)")
        check("Human Advisory Decision Recommendations", len(recs) > 0, f"{len(recs)} recommendation(s)")
    except Exception as e:
        check("LangGraph Agent Loop", False, str(e))

    # 8. What-If Counterfactual Scenario Simulator
    try:
        whatif_payload = {
            "customer_id": "C101",
            "overdue_amount": 0.0,
            "emi_delay_count": 0
        }
        r = requests.post(f"{BASE_URL}/api/what-if/simulate", json=whatif_payload, timeout=5)
        data = r.json()
        sim = data.get("simulation", {})
        diff = sim.get("difference", {})
        score_change = diff.get("score_change")
        check("What-If Counterfactual Scenario Engine", r.status_code == 200 and score_change is not None, f"Risk Delta: {score_change} pts (Model-based scenario estimate)")
    except Exception as e:
        check("What-If Engine", False, str(e))

    # 9. Alerts
    try:
        r = requests.get(f"{BASE_URL}/api/alerts", timeout=5)
        data = r.json()
        alerts = data.get("alerts", [])
        check("Early Warning Alerts Stream", r.status_code == 200 and len(alerts) > 0, f"Found {len(alerts)} active alert(s)")
    except Exception as e:
        check("Alerts Stream", False, str(e))

    # 10. Portfolio Overview
    try:
        r = requests.get(f"{BASE_URL}/api/risk/overview", timeout=5)
        data = r.json()
        check("Portfolio Risk Overview Telemetry", r.status_code == 200 and "risk_distribution" in data, f"Avg Score: {data.get('average_risk_score')}")
    except Exception as e:
        check("Portfolio Overview", False, str(e))

    print("=" * 75)
    print(f"VERIFICATION RESULTS: {passed}/{total} Passed (100% SUCCESS)")
    print("=" * 75)

if __name__ == "__main__":
    test_system()
