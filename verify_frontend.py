import urllib.request
import json
import sys

BASE_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:5000"

pages = [
    "/",
    "/src/main.jsx",
    "/src/App.jsx",
    "/src/pages/Dashboard.jsx",
    "/src/pages/Customers.jsx",
    "/src/pages/CustomerDetails.jsx",
    "/src/pages/Alerts.jsx",
    "/src/pages/Transactions.jsx",
    "/src/pages/Complaints.jsx",
    "/src/components/RiskBadge.jsx",
    "/src/components/RiskScoreCard.jsx",
    "/src/components/RiskSignalCard.jsx",
    "/src/components/RecommendationCard.jsx",
    "/src/components/SentimentCard.jsx",
    "/src/components/AnomalyCard.jsx",
    "/src/components/EventTimeline.jsx",
    "/src/components/SimulationModal.jsx",
]

print("=== VERIFYING FRONTEND MODULES ===")
for p in pages:
    url = f"{BASE_URL}{p}"
    try:
        req = urllib.request.urlopen(url, timeout=5)
        print(f"[OK] {p} -> HTTP {req.status}")
    except Exception as e:
        print(f"[FAIL] {p} -> {e}")
        sys.exit(1)

print("\n=== VERIFYING BACKEND ENDPOINTS CONSUMED BY DASHBOARD ===")
endpoints = [
    "/api/customers",
    "/api/customers/C001",
    "/api/risk/C001",
    "/api/risk/C001/history",
    "/api/risk/alerts",
    "/api/events/customer/C001",
    "/api/complaints",
    "/api/transactions",
]

for ep in endpoints:
    url = f"{BACKEND_URL}{ep}"
    try:
        req = urllib.request.urlopen(url, timeout=5)
        data = json.loads(req.read().decode())
        item_count = len(data.get("data", [])) if isinstance(data.get("data"), list) else "object"
        print(f"[OK] {ep} -> HTTP {req.status} ({item_count})")
    except Exception as e:
        print(f"[FAIL] {ep} -> {e}")
        sys.exit(1)

print("\n=== ALL FRONTEND MODULES & BACKEND ENDPOINTS ARE VERIFIED 100% ===")
