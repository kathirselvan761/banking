"""
Full System Integration Verification: All 16+ API Endpoints
Tests:
1. Python FastAPI Microservice Endpoints (:8000)
   - GET  /health
   - POST /predict/default-risk
   - POST /analyze/sentiment
   - POST /analyze/complaint
   - POST /detect/recurring-issue
   - POST /detect/transaction-anomaly
   - POST /analyze/customer-risk
   - POST /what-if/default-risk
   - POST /analyze/voice (multipart .wav)
2. Node.js Express Backend Endpoints (:5000)
   - GET  /api/health
   - GET  /api/customers
   - GET  /api/customers/:customerId
   - GET  /api/risk/:customerId
   - GET  /api/risk/:customerId/history
   - GET  /api/events/customer/:customerId
   - POST /api/what-if/default-risk
   - GET  /api/what-if/:customerId
3. React Frontend Dev Server (:5173)
   - GET  http://localhost:5173 (Status 200)
"""

import urllib.request
import urllib.error
import json
import os
import sys

FASTAPI_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:5173"

def request_json(url, method="GET", data=None, headers=None, timeout=45):
    if headers is None:
        headers = {}
    encoded = json.dumps(data).encode("utf-8") if data is not None else None
    if data is not None and "Content-Type" not in headers:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=encoded, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {"error": content}
    except Exception as e:
        return 0, {"error": str(e)}

def request_multipart(url, file_path, field_name="file", timeout=45):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    filename = os.path.basename(file_path)
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode("utf-8"))
    body.extend(b"Content-Type: audio/wav\r\n\r\n")
    body.extend(file_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {"error": content}
    except Exception as e:
        return 0, {"error": str(e)}

def main():
    print("=" * 70)
    print(" FULL SYSTEM INTEGRATION VERIFICATION: ALL 16+ API ENDPOINTS")
    print("=" * 70)
    passed = 0
    total = 0

    def check(name, condition, details=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"[PASS] {name} {details}")
        else:
            print(f"[FAIL] {name} - {details}")

    # =========================================================================
    # 1. FastAPI AI Service Endpoints (:8000)
    # =========================================================================
    print("\n--- 1. Python FastAPI AI Service Endpoints (:8000) ---")

    # 1.1 GET /health
    status, res = request_json(f"{FASTAPI_URL}/health")
    check("1.1 GET /health", status == 200 and res.get("status") in ["ok", "healthy"], f"(HTTP {status}, status: {res.get('status')})")

    # 1.2 POST /predict/default-risk
    payload = {
        "credit_score": 680,
        "monthly_income": 50000,
        "loan_amount": 400000,
        "monthly_emi": 12000,
        "overdue_amount": 18000,
        "payment_delay_count": 2,
        "complaint_count": 2,
        "negative_sentiment_count": 1,
        "transaction_count": 30,
        "transaction_anomaly_count": 1
    }
    status, res = request_json(f"{FASTAPI_URL}/predict/default-risk", method="POST", data=payload)
    has_signals = "important_risk_signals" in res
    check("1.2 POST /predict/default-risk", status == 200 and "risk_score" in res and has_signals, f"(Score: {res.get('risk_score')}, Signals: {len(res.get('important_risk_signals', []))})")

    # 1.3 POST /analyze/sentiment
    payload = {"text": "I am angry because my transaction was declined."}
    status, res = request_json(f"{FASTAPI_URL}/analyze/sentiment", method="POST", data=payload)
    check("1.3 POST /analyze/sentiment", status == 200 and res.get("sentiment") == "negative", f"(Sentiment: {res.get('sentiment')}, Neg: {res.get('negative_score')})")

    # 1.4 POST /analyze/complaint
    payload = {"text": "My EMI payment failed twice and support did not help."}
    status, res = request_json(f"{FASTAPI_URL}/analyze/complaint", method="POST", data=payload)
    check("1.4 POST /analyze/complaint", status == 200 and "category" in res and "keywords" in res, f"(Cat: {res.get('category')}, Keywords: {res.get('keywords')})")

    # 1.5 POST /detect/recurring-issue
    payload = {
        "current_complaint": "My EMI payment failed again and support has not solved my problem.",
        "previous_complaints": [
            "EMI payment failed twice and support did not help.",
            "I want to change my registered address."
        ]
    }
    status, res = request_json(f"{FASTAPI_URL}/detect/recurring-issue", method="POST", data=payload)
    check("1.5 POST /detect/recurring-issue", status == 200 and res.get("is_recurring") is True, f"(Recurring: {res.get('is_recurring')}, Sim: {res.get('similarity_score')})")

    # 1.6 POST /detect/transaction-anomaly
    payload = {
        "amount": 250000,
        "transaction_count": 12,
        "hour_of_day": 3,
        "location_frequency": 1,
        "device_frequency": 1
    }
    status, res = request_json(f"{FASTAPI_URL}/detect/transaction-anomaly", method="POST", data=payload)
    check("1.6 POST /detect/transaction-anomaly", status == 200 and "is_anomaly" in res, f"(Anomaly: {res.get('is_anomaly')}, Score: {res.get('anomaly_score')})")

    # 1.7 POST /analyze/customer-risk
    payload = {
        "customer_id": "C001",
        "features": {
            "credit_score": 680,
            "monthly_income": 50000,
            "loan_amount": 400000,
            "monthly_emi": 12000,
            "overdue_amount": 24000,
            "payment_delay_count": 2,
            "complaint_count": 2
        },
        "anomalies": [],
        "sentiment_summary": {"negative": 0.8}
    }
    status, res = request_json(f"{FASTAPI_URL}/analyze/customer-risk", method="POST", data=payload)
    current_risk = res.get("current_risk", {})
    check("1.7 POST /analyze/customer-risk", status == 200 and "score" in current_risk and "recommendations" in res, f"(Risk Score: {current_risk.get('score')}, Recs: {len(res.get('recommendations', []))})")

    # 1.8 POST /what-if/default-risk
    payload = {
        "customer_id": "C001",
        "base_features": {
            "credit_score": 680,
            "income": 50000,
            "loan_amount": 400000,
            "monthly_emi": 12000,
            "overdue_amount": 24000,
            "payment_delay_count": 2,
            "complaints_count": 2
        },
        "scenario_changes": {
            "overdue_amount": 0,
            "payment_delay_count": 0
        }
    }
    status, res = request_json(f"{FASTAPI_URL}/what-if/default-risk", method="POST", data=payload)
    check("1.8 POST /what-if/default-risk", status == 200 and "scenario" in res and "change" in res, f"(Orig: {res.get('original', {}).get('risk_score')} -> Sim: {res.get('scenario', {}).get('risk_score')}, Change: {res.get('change', {}).get('percentage_points')} pts)")

    # 1.9 POST /analyze/voice
    wav_path = os.path.join("data", "test_customer_call.wav")
    if os.path.exists(wav_path):
        status, res = request_multipart(f"{FASTAPI_URL}/analyze/voice", wav_path, field_name="file")
        check("1.9 POST /analyze/voice (Whisper)", status == 200 and "transcript" in res, f"(Transcript: '{res.get('transcript', '')[:40]}...', Lang: {res.get('language')})")
    else:
        print("[SKIP] 1.9 POST /analyze/voice - test_customer_call.wav not found")

    # =========================================================================
    # 2. Node.js Express Backend Endpoints (:5000)
    # =========================================================================
    print("\n--- 2. Node.js Express Backend Endpoints (:5000) ---")

    # 2.1 GET /api/health
    status, res = request_json(f"{BACKEND_URL}/api/health")
    check("2.1 GET /api/health", status == 200 and res.get("status") == "healthy", f"(HTTP {status})")

    # 2.2 GET /api/customers
    status, res = request_json(f"{BACKEND_URL}/api/customers")
    customers = res.get("data", [])
    check("2.2 GET /api/customers", status == 200 and len(customers) > 0, f"(Found {len(customers)} customers)")

    # 2.3 GET /api/customers/:customerId
    status, res = request_json(f"{BACKEND_URL}/api/customers/C001")
    data = res.get("data", {})
    has_profile = "customer" in data and "loan" in data
    check("2.3 GET /api/customers/C001", status == 200 and has_profile, f"(Name: {data.get('customer', {}).get('name')}, Loan: {data.get('loan', {}).get('loan_amount')})")

    # 2.4 GET /api/risk/:customerId
    status, res = request_json(f"{BACKEND_URL}/api/risk/C001")
    risk = res.get("risk", {})
    check("2.4 GET /api/risk/C001", status == 200 and "risk_score" in risk, f"(Risk Score: {risk.get('risk_score')}, Level: {risk.get('risk_level')})")

    # 2.5 GET /api/risk/:customerId/history
    status, res = request_json(f"{BACKEND_URL}/api/risk/C001/history")
    history = res.get("data", [])
    check("2.5 GET /api/risk/:customerId/history", status == 200 and isinstance(history, list), f"(History items: {len(history)})")

    # 2.6 GET /api/events/customer/:customerId
    status, res = request_json(f"{BACKEND_URL}/api/events/customer/C001")
    events = res.get("data", [])
    check("2.6 GET /api/events/customer/C001", status == 200 and isinstance(events, list), f"(Events count: {len(events)})")

    # 2.7 POST /api/what-if/default-risk
    payload = {
        "customer_id": "C001",
        "scenario_changes": {
            "overdue_amount": 0,
            "payment_delay_count": 0
        }
    }
    status, res = request_json(f"{BACKEND_URL}/api/what-if/default-risk", method="POST", data=payload)
    check("2.7 POST /api/what-if/default-risk", status == 200 and res.get("success") is True and "scenario" in res, f"(Orig: {res.get('original', {}).get('risk_score')} -> Sim: {res.get('scenario', {}).get('risk_score')}, Pts: {res.get('change', {}).get('percentage_points')})")

    # 2.8 GET /api/what-if/:customerId
    status, res = request_json(f"{BACKEND_URL}/api/what-if/C001")
    scenarios = res.get("data", [])
    check("2.8 GET /api/what-if/C001", status == 200 and isinstance(scenarios, list) and len(scenarios) > 0, f"(Scenarios saved: {len(scenarios)})")

    # =========================================================================
    # 3. React Frontend Dev Server (:5173)
    # =========================================================================
    print("\n--- 3. React Frontend Application (:5173) ---")
    try:
        req = urllib.request.Request(FRONTEND_URL)
        with urllib.request.urlopen(req, timeout=10) as resp:
            frontend_status = resp.status
            content = resp.read().decode("utf-8")
            is_valid_html = "<!DOCTYPE html>" in content or "<html" in content
            check("3.1 GET http://localhost:5173", frontend_status == 200 and is_valid_html, f"(HTTP {frontend_status}, HTML payload confirmed)")
    except Exception as e:
        check("3.1 GET http://localhost:5173", False, str(e))

    # =========================================================================
    # Final Summary
    # =========================================================================
    print("\n" + "=" * 70)
    print(f" ENDPOINT VERIFICATION SUMMARY: {passed}/{total} Passed")
    print("=" * 70)

    if passed == total:
        print("\n>>> ALL 16+ API ENDPOINTS VERIFIED & 100% OPERATIONAL! <<<\n")
        return 0
    else:
        print(f"\n>>> WARNING: {total - passed} endpoint(s) did not pass. <<<\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
