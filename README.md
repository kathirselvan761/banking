# AI-Powered Early Warning & Decision Intelligence System for Banking

> **24-Hour Hackathon Prototype**  
> A proactive, event-driven banking intelligence system that detects loan delinquency and predicts defaults before they occur, flags transaction anomalies in real-time, and continuously maintains borrower risk profiles.

---

## 🏗️ 1. System Architecture

The system operates as an event-driven decoupled architecture connecting core banking event simulators to machine learning inference engines:

```
┌────────────────────────────────────────────────────────────────────────┐
│                         Core Banking Events                            │
│  - EMI Payment Failures                                                │
│  - Overdue Balances                                                    │
│  - Unusual Transactions                                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Node.js + Express Backend API (:5000)                │
│  - Realtime Event Ingestion (/api/simulate/emi-failure/:customerId)    │
│  - Behavioral Anomaly Ingestion (/api/simulate/transaction/:customerId)│
│  - Customer Risk State Ledger (/api/risk/:customerId)                  │
│  - MongoDB Mongoose Schemas (customers, loans, transactions, events)   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │   MongoDB Database     │       │ FastAPI ML API (:8000) │
       │   database: banking_ai │       │ - POST /predict/...    │
       │   Port: 27017          │       │ - POST /detect/...     │
       └────────────────────────┘       └────────────┬───────────┘
                                                     │
                                    ┌────────────────┴───────────────────┐
                                    │  Trained Machine Learning Models   │
                                    │  1. XGBoost Default Classifier     │
                                    │     (Stratified AUC: 0.9306)       │
                                    │  2. Isolation Forest Detector      │
                                    │     (Contamination: 0.05)          │
                                    └────────────────────────────────────┘
```

---

## 🗄️ 2. MongoDB Database & Schemas

- **Database Name**: `banking_ai`
- **Port**: `27017`

### Collections:
1. `customers`: Customer demographic profiles, credit scores, monthly income, employment types.
2. `loans`: Loan amounts, monthly EMI, outstanding balance, overdue amount, EMI delay counts, status (`CURRENT`, `WATCHLIST`, `DELINQUENT`).
3. `transactions`: Transaction streams, payment methods, merchant categories, anomaly decision flags (`is_anomaly`, `anomaly_score`).
4. `complaints`: Customer grievances, categories, priority, and sentiment logs.
5. `banking_events`: Immutable audit trail of realtime events (`EMI_PAYMENT_SUCCESS`, `EMI_PAYMENT_FAILED`, `TRANSACTION_COMPLETED`, etc.).
6. `risk_events`: Historical risk snapshots tracking dynamic XGBoost default probabilities and risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

---

## 📦 3. Installation Guide

### Backend (Node.js)
```bash
cd backend
npm install
```

### AI Service (Python)
```bash
cd ai-service
# Recommended: create virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

---

## ⚙️ 4. MongoDB Configuration

Ensure MongoDB is running locally or provide a connection string in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/banking_ai
AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

### Seed Synthetic Demo Data
Populate MongoDB with 10 demo customers (including main test customer `C001`), 10 loans, 21 transactions, and 10 complaints:
```bash
cd backend
npm run seed
# or: node seed.js
```

---

## 🤖 5. ML Models & Training

### 1. Synthetic Dataset (`data/training_data.csv`)
Generate 1,500 realistic borrower records with realistic non-linear risk correlations:
```bash
python data/generate_dataset.py
```

### 2. Train Models (XGBoost + Isolation Forest)
Run the dedicated training script:
```bash
cd ai-service
python train_models.py
```
- **XGBoost Classifier**: Saved to `ai-service/saved_models/xgboost_default_model.json`
  - Accuracy: **0.8833**
  - Precision: **0.7642**
  - Recall: **0.8901**
  - F1-Score: **0.8223**
  - ROC-AUC: **0.9306**
- **Isolation Forest Model**: Saved to `ai-service/saved_models/isolation_forest.pkl`
  - Contamination: **0.05**

---

## 🚀 6. Starting the Services

### Terminal 1: Start FastAPI ML Service
```bash
cd ai-service
python -m uvicorn main:app --reload --port 8000
```
- Health URL: `http://localhost:8000/health`
- Swagger UI: `http://localhost:8000/docs`

### Terminal 2: Start Node.js Backend API
```bash
cd backend
npm run dev
# or: npm start
```
- Health URL: `http://localhost:5000/api/health`

---

## 🌐 7. API Endpoints

### AI Microservice (FastAPI — Port 8000)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status |
| `POST` | `/predict/default-risk` | XGBoost 90-day default probability & risk score |
| `POST` | `/detect/transaction-anomaly` | Isolation Forest behavioral anomaly detection |

### Backend API (Express.js — Port 5000)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend + MongoDB + AI microservice health check |
| `GET` | `/api/customers` | Fetch all customers |
| `GET` | `/api/customers/:customerId` | Comprehensive profile: loans, txns, complaints, events, latest risk |
| `GET` | `/api/risk/:customerId` | Retrieve latest RiskEvent for a customer |
| `GET` | `/api/events/customer/:customerId` | Historical banking event audit stream |
| `POST` | `/api/simulate/emi-failure/:customerId` | Trigger EMI failure, increment overdue, run XGBoost, record RiskEvent |
| `POST` | `/api/simulate/transaction/:customerId` | Ingest transaction, run Isolation Forest, record BankingEvent |

---

## 🧪 8. Example Realtime Demo Flow (Customer C001)

### Baseline State:
Customer `C001` starts with clean standing:
- `credit_score`: 680
- `monthly_income`: 50,000
- `loan_amount`: 400,000
- `monthly_emi`: 12,000
- `overdue_amount`: 0
- `emi_delay_count`: 0
- `risk_score`: 5 (**LOW**)

### Step 1: Simulate 1st EMI Payment Failure
```bash
curl -X POST http://localhost:5000/api/simulate/emi-failure/C001
```
**Response:**
```json
{
  "success": true,
  "customer_id": "C001",
  "event": {
    "event_type": "EMI_PAYMENT_FAILED"
  },
  "risk": {
    "risk_score": 42,
    "risk_level": "MEDIUM",
    "default_probability": 0.43
  }
}
```
*Result: Loan updated (`emi_delay_count = 1`, `overdue_amount = 12000`). Risk elevated from LOW to MEDIUM.*

### Step 2: Simulate 2nd Consecutive EMI Failure
```bash
curl -X POST http://localhost:5000/api/simulate/emi-failure/C001
```
**Response:**
```json
{
  "success": true,
  "customer_id": "C001",
  "event": {
    "event_type": "EMI_PAYMENT_FAILED"
  },
  "risk": {
    "risk_score": 75,
    "risk_level": "CRITICAL",
    "default_probability": 0.75
  }
}
```
*Result: Loan updated (`emi_delay_count = 2`, `overdue_amount = 24000`). Risk elevated to CRITICAL.*

### Step 3: Simulate Sudden Unusual Transaction Spike
```bash
curl -X POST http://localhost:5000/api/simulate/transaction/C001 \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 95000,
    "transaction_type": "PURCHASE",
    "merchant_category": "ELECTRONICS",
    "location": "Chennai",
    "device_id": "DEVICE_NEW_01",
    "payment_method": "CARD"
  }'
```
**Response:**
```json
{
  "success": true,
  "transaction": {
    "transaction_id": "TXN-...",
    "customer_id": "C001",
    "amount": 95000,
    "merchant_category": "ELECTRONICS",
    "location": "Chennai",
    "is_anomaly": true,
    "anomaly_score": -0.06
  },
  "anomaly": {
    "is_anomaly": true,
    "anomaly_score": -0.06
  }
}
```
*Result: Isolation Forest flags the transaction as unusual behaviour (`is_anomaly: true`, `anomaly_score: -0.06`).*

### Step 4: Verify Updated Risk State & Audit Events
```bash
# Check current risk score
curl http://localhost:5000/api/risk/C001

# Inspect complete event timeline
curl http://localhost:5000/api/events/customer/C001
```
