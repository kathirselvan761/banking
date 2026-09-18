"""
Step 4 AI Intelligence Layer Comprehensive Verification & Demo Flow Test
"""

import os
import sys
import json
import requests

FASTAPI_URL = os.environ.get("FASTAPI_URL", "http://localhost:8000")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:5000")

def print_header(title):
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)

def assert_status(res, expected=200, step=""):
    if res.status_code != expected:
        print(f"[FAIL] {step} expected status {expected}, got {res.status_code}")
        print("Response:", res.text)
        sys.exit(1)
    else:
        print(f"[PASS] {step} (Status {res.status_code})")

def main():
    print_header("STARTING STEP 4 ACCEPTANCE & VERIFICATION TESTS")

    # 1. Health Checks
    print_header("TEST 1: Fast API & Node Backend Health")
    res = requests.get(f"{FASTAPI_URL}/health")
    assert_status(res, 200, "FastAPI /health")
    print("FastAPI Health:", res.json())

    res = requests.get(f"{BACKEND_URL}/api/health")
    assert_status(res, 200, "Node Backend /api/health")
    print("Node Backend Health:", res.json().get("status"))

    # 2. Text Sentiment Analysis (FinBERT)
    print_header("TEST 2: POST /analyze/sentiment (FinBERT)")
    res = requests.post(f"{FASTAPI_URL}/analyze/sentiment", json={
        "text": "I am frustrated because my EMI payment failed again."
    })
    assert_status(res, 200, "POST /analyze/sentiment")
    s_data = res.json()
    print("Sentiment Response:", json.dumps(s_data, indent=2))
    assert s_data["sentiment"] == "negative", "Expected negative sentiment"
    assert "positive_score" in s_data and "negative_score" in s_data, "Missing score fields"

    # 3. Complaint Classification & Keyword Extraction
    print_header("TEST 3: POST /analyze/complaint")
    res = requests.post(f"{FASTAPI_URL}/analyze/complaint", json={
        "text": "My EMI payment failed twice and support has not solved my issue."
    })
    assert_status(res, 200, "POST /analyze/complaint")
    c_data = res.json()
    print("Complaint Response:", json.dumps(c_data, indent=2))
    assert c_data["category"] == "PAYMENT_FAILURE", f"Expected PAYMENT_FAILURE, got {c_data['category']}"
    assert c_data["sentiment"] == "negative", "Expected negative sentiment"
    assert "EMI" in c_data["keywords"] or "emi" in [k.lower() for k in c_data["keywords"]], "EMI keyword should be extracted"

    # 4. SBERT Recurring Issue Detection
    print_header("TEST 4: POST /detect/recurring-issue (Sentence-BERT)")
    res = requests.post(f"{FASTAPI_URL}/detect/recurring-issue", json={
        "current_complaint": "My loan payment failed again and customer service hasn't fixed it.",
        "previous_complaints": [
            "EMI payment failed and support did not help.",
            "I want to change my registered address."
        ]
    })
    assert_status(res, 200, "POST /detect/recurring-issue")
    r_data = res.json()
    print("Recurring Issue Response:", json.dumps(r_data, indent=2))
    assert r_data["is_recurring"] is True, "Expected is_recurring to be True"
    assert r_data["similarity_score"] >= 0.65, f"Expected high similarity score >= 0.65, got {r_data['similarity_score']}"

    # 5. Direct Whisper Audio Transcription (FastAPI)
    print_header("TEST 5: POST /analyze/voice (Direct to FastAPI)")
    audio_path = os.path.join(os.path.dirname(__file__), "data", "test_customer_call.wav")
    if os.path.exists(audio_path):
        with open(audio_path, "rb") as f:
            res = requests.post(f"{FASTAPI_URL}/analyze/voice", files={"file": ("test_customer_call.wav", f, "audio/wav")})
        assert_status(res, 200, "POST /analyze/voice")
        v_data = res.json()
        print("Whisper Voice Response:", json.dumps(v_data, indent=2))
        assert len(v_data.get("transcript", "")) > 0, "Transcript should not be empty"
        assert "sentiment" in v_data and "category" in v_data, "Missing cascaded NLP fields"
    else:
        print(f"[WARN] Audio file not found at {audio_path}")

    # 6. Default Risk Prediction + SHAP Explainability
    print_header("TEST 6: POST /predict/default-risk (XGBoost + SHAP)")
    res = requests.post(f"{FASTAPI_URL}/predict/default-risk", json={
        "credit_score": 580,
        "monthly_income": 35000,
        "loan_amount": 400000,
        "monthly_emi": 12000,
        "overdue_amount": 24000,
        "payment_delay_count": 2,
        "complaint_count": 2
    })
    assert_status(res, 200, "POST /predict/default-risk")
    d_data = res.json()
    print("Default Risk Response:", json.dumps(d_data, indent=2))
    assert "probability" in d_data and "important_risk_signals" in d_data, "Missing probability or SHAP signals"
    assert len(d_data["important_risk_signals"]) > 0, "SHAP signals should not be empty"

    # 7. Unified Customer Risk Analysis
    print_header("TEST 7: POST /analyze/customer-risk (Unified Decision Intelligence)")
    res = requests.post(f"{FASTAPI_URL}/analyze/customer-risk", json={
        "customer_id": "C001",
        "features": {
            "credit_score": 680,
            "income": 50000,
            "loan_amount": 400000,
            "overdue_amount": 18000,
            "payment_delay_count": 2,
            "complaint_count": 3,
            "negative_sentiment_count": 2
        }
    })
    assert_status(res, 200, "POST /analyze/customer-risk")
    u_data = res.json()
    print("Unified Customer Risk Response:", json.dumps(u_data, indent=2))
    assert u_data["customer_id"] == "C001"
    assert "current_risk" in u_data and "recommendations" in u_data

    # 8. Complete Realtime Narrative Demo Flow (Customer C001)
    print_header("TEST 8: Complete Realtime Demo Flow for Fictional Customer C001")
    
    # 8a. Baseline Risk
    print("\n--> 8a. Check Initial Baseline Risk for C001")
    res = requests.get(f"{BACKEND_URL}/api/risk/C001")
    assert_status(res, 200, "GET /api/risk/C001")
    init_risk = res.json()
    print("Initial Risk:", json.dumps(init_risk, indent=2))

    # 8b. Simulate 1st EMI Payment Failure
    print("\n--> 8b. Simulate 1st EMI Payment Failure")
    res = requests.post(f"{BACKEND_URL}/api/simulate/emi-failure/C001")
    assert_status(res, 200, "POST /api/simulate/emi-failure/C001 (1st)")
    print("1st EMI Failure Result:", res.json().get("risk"))

    # 8c. Simulate 2nd EMI Payment Failure
    print("\n--> 8c. Simulate 2nd EMI Payment Failure")
    res = requests.post(f"{BACKEND_URL}/api/simulate/emi-failure/C001")
    assert_status(res, 200, "POST /api/simulate/emi-failure/C001 (2nd)")
    print("2nd EMI Failure Result:", res.json().get("risk"))

    # 8d. Submit Grievance Complaint (Triggers NLP, SBERT, XGBoost, SHAP, Recommendations, RiskEvent)
    print("\n--> 8d. Submit Realtime Grievance Complaint")
    complaint_text = "I am frustrated because my EMI payment failed again and nobody resolved my issue."
    res = requests.post(f"{BACKEND_URL}/api/simulate/complaint/C001", json={
        "text": complaint_text
    })
    assert_status(res, 200, "POST /api/simulate/complaint/C001")
    cmp_res = res.json()
    print("Realtime Complaint Simulation Result:", json.dumps(cmp_res, indent=2))
    assert cmp_res["customer_id"] == "C001"
    assert cmp_res["complaint"]["sentiment"] == "negative"
    assert len(cmp_res["recommendations"]) > 0, "Expected supervisory recommendations"

    # 8e. Submit Second Complaint to trigger SBERT recurring issue detection
    print("\n--> 8e. Submit Second Complaint to Verify SBERT Recurring Issue Detection")
    res = requests.post(f"{BACKEND_URL}/api/simulate/complaint/C001", json={
        "text": "My loan payment failed again and customer support has not fixed it."
    })
    assert_status(res, 200, "POST /api/simulate/complaint/C001 (recurring)")
    rec_cmp = res.json()
    print("Recurring Issue Result:", json.dumps(rec_cmp.get("recurring_issue"), indent=2))
    assert rec_cmp.get("recurring_issue", {}).get("is_recurring") is True, "Expected SBERT to detect recurring issue"

    # 8f. Voice Audio Call Ingestion (Whisper STT via Node)
    print("\n--> 8f. Ingest Customer Call Recording via Node Backend")
    if os.path.exists(audio_path):
        with open(audio_path, "rb") as f:
            res = requests.post(
                f"{BACKEND_URL}/api/customers/C001/voice",
                files={"audio": ("test_customer_call.wav", f, "audio/wav")}
            )
        assert_status(res, 200, "POST /api/customers/C001/voice")
        voice_res = res.json()
        print("Backend Voice Ingestion Result:", json.dumps(voice_res, indent=2))
        assert len(voice_res.get("transcript", "")) > 0

    # 8g. Verify Banking Events Timeline for C001
    print("\n--> 8g. Verify Banking Events Timeline for C001")
    res = requests.get(f"{BACKEND_URL}/api/events/customer/C001")
    assert_status(res, 200, "GET /api/events/customer/C001")
    events_data = res.json()
    print(f"Total Logged Events for C001: {events_data.get('count')}")
    event_types = [e.get("event_type") for e in events_data.get("data", [])]
    print("Event Types Recorded:", event_types)
    assert "EMI_PAYMENT_FAILED" in event_types
    assert "COMPLAINT_CREATED" in event_types

    # 8h. Verify Transaction Anomaly (Step 3 endpoint)
    print("\n--> 8h. Verify Transaction Anomaly (Preserving Step 3 Endpoint)")
    res = requests.post(f"{BACKEND_URL}/api/simulate/transaction/C001", json={
        "amount": 95000,
        "location": "Foreign_Online_Casino",
        "merchant_category": "GAMBLING"
    })
    assert_status(res, 200, "POST /api/simulate/transaction/C001")
    print("Transaction Result:", res.json().get("anomaly"))

    # 9. Error Handling Verification
    print_header("TEST 9: Error Handling Verification")
    # Empty sentiment text
    res = requests.post(f"{FASTAPI_URL}/analyze/sentiment", json={"text": "   "})
    assert_status(res, 400, "Empty text to /analyze/sentiment")
    print("Empty text rejected with 400:", res.json())

    # Empty complaint text
    res = requests.post(f"{FASTAPI_URL}/analyze/complaint", json={"text": ""})
    assert_status(res, 400, "Empty text to /analyze/complaint")
    print("Empty complaint rejected with 400:", res.json())

    # Missing customer
    res = requests.post(f"{BACKEND_URL}/api/simulate/complaint/NON_EXISTENT_999", json={"text": "Test"})
    assert_status(res, 404, "Non-existent customer to simulate complaint")
    print("Non-existent customer rejected with 404:", res.json())

    print_header("ALL STEP 4 ACCEPTANCE TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
