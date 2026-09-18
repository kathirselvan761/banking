# AI-Powered Early Warning & Decision Intelligence System for Banking

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248.svg)](https://www.mongodb.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-1.7+-red.svg)](https://xgboost.readthedocs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Enterprise Hackathon Prototype**  
> An end-to-end, event-driven banking decision intelligence platform that identifies retail borrower default risk 30–90 days in advance. Combines supervised machine learning (**XGBoost**), explainable AI (**SHAP**), financial NLP (**FinBERT**), voice intelligence (**OpenAI Whisper**), semantic similarity (**Sentence-BERT**), unsupervised transaction anomaly detection (**Isolation Forest**), and interactive **What-If Scenario Simulation** into an executive risk dashboard.

---

## 📑 Table of Contents

1. [System Architecture](#-system-architecture)
2. [Key Capabilities & Modules](#-key-capabilities--modules)
3. [Technology Stack](#-technology-stack)
4. [Repository Structure](#-repository-structure)
5. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
6. [Installation & Setup](#-installation--setup)
7. [Environment Variables](#-environment-variables)
8. [Machine Learning Models & Training](#-machine-learning-models--training)
9. [Starting the Application](#-starting-the-application)
10. [Docker Deployment](#-docker-deployment)
11. [Complete API Reference](#-complete-api-reference)
12. [What-If Decision Intelligence Simulator](#-what-if-decision-intelligence-simulator)
13. [End-to-End Hackathon Demo Walkthrough (Customer C001)](#-end-to-end-hackathon-demo-walkthrough-customer-c001)
14. [Testing & Verification Suites](#-testing--verification-suites)
15. [Decision-Support & Governance Principles](#-decision-support--governance-principles)
16. [Troubleshooting](#-troubleshooting)

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CORE BANKING EVENTS                                    │
│   - Scheduled EMI Payments / Failures        - Customer Support Grievance Complaints   │
│   - Telephony Inbound Audio Calls            - Debit/Credit Transactions Streams       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         NODE.JS + EXPRESS BACKEND API (:5000)                          │
│   - Ingestion & Event Simulation Endpoints   - Mongoose ODM & Persistence Engine       │
│   - Feature Aggregation & Synchronization    - Immutable Event Ledger Audit Trail      │
│   - Non-blocking Microservice Gateway        - What-If Scenario History Tracker        │
└───────────────────────┬────────────────────────────────────────┬───────────────────────┘
                        │                                        │
                        ▼                                        ▼
┌────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
│        MONGODB DATABASE (:27017)       │     │     PYTHON FASTAPI SERVICE (:8000)      │
│  - Database: banking_ai                │     │  - /predict/default-risk (XGBoost)      │
│  - Collections:                        │     │  - /analyze/sentiment (FinBERT)         │
│    • customers     • complaints        │     │  - /analyze/complaint (Classifier)      │
│    • loans         • voice_transcripts │     │  - /analyze/voice (Whisper STT)         │
│    • transactions  • banking_events    │     │  - /detect/recurring-issue (SBERT)      │
│    • risk_events   • whatif_scenarios  │     │  - /detect/transaction-anomaly (iForest)│
└────────────────────────────────────────┘     │  - /what-if/default-risk (Simulator)    │
                                               └────────────────────┬────────────────────┘
                                                                    │
                                            ┌───────────────────────┴────────────────────┐
                                            │        AI / ML INTELLIGENCE LAYER          │
                                            │  1. XGBoost Delinquency Classifier         │
                                            │  2. TreeSHAP Feature Attribution Explainer │
                                            │  3. FinBERT Financial Sentiment Engine     │
                                            │  4. OpenAI Whisper Automatic Speech-to-Text│
                                            │  5. SBERT (all-MiniLM-L6-v2) Similarity    │
                                            │  6. Rule-Based Supervisory Recommendations │
                                            │  7. Isolation Forest Spending Outlier Model│
                                            └────────────────────────────────────────────┘
                                                                    ▲
                                                                    │
┌───────────────────────────────────────────────────────────────────┴────────────────────┐
│                    REACT 18 + VITE EXECUTIVE RISK DASHBOARD (:5173)                     │
│   - Live Portfolio Risk Distribution (Stats, Metrics, Filters, Risk Badges)            │
│   - Borrower Deep-Dive View with Prominent RiskAlertBanner                             │
│   - Gauge Probability & Historical Score Trajectory (Recharts)                         │
│   - Top Contributing Risk Factors (SHAP Feature Attributions)                          │
│   - Grievance FinBERT Analysis & Whisper Voice Call Transcription Logs                 │
│   - Unsupervised Spending Anomaly Detection Feed                                       │
│   - What-If Scenario Workbench with Presets, Slider Controls, & Delta Metrics          │
│   - In-app Simulation Triggers (Inject EMI failure, Complaint, or Transaction)         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Capabilities & Modules

| Module | Purpose | Technology |
|---|---|---|
| **Default Risk Predictor** | Predicts 90-day loan delinquency probability | XGBoost Classifier (Trained on credit, repayment, complaints, cashflow) |
| **Explainable AI (XAI)** | Calculates directional impact of each risk signal | TreeSHAP (Additive Shapley explanations) |
| **Grievance Sentiment** | Evaluates customer emotional distress | ProsusAI/finbert (Financial domain NLP) |
| **Voice Intelligence** | Transcribes inbound telephony call recordings | OpenAI Whisper (Speech-to-Text) |
| **Recurring Issue Engine** | Identifies recurring borrower grievances via cosine similarity | Sentence-BERT (`sentence-transformers/all-MiniLM-L6-v2`) |
| **Transaction Outliers** | Uncovers abnormal transaction spikes or drainages | Scikit-learn Isolation Forest |
| **Recommendation Engine** | Generates non-autonomous supervisory risk interventions | Rule-based banking policy engine |
| **What-If Simulator** | Simulates outcome of loan restructurings, waivers, or payments | FastAPI + XGBoost Re-scoring Engine |
| **Executive Dashboard** | Modern, responsive interface for bank risk officers | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Dark-mode financial design system)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Responsive Line & Bar charts)
- **HTTP Client**: Axios with 30s timeout and automatic endpoint resolution

### Backend
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js
- **Database ODM**: Mongoose 8+
- **File Upload**: Multer (Telephony audio handling)
- **CORS / Security**: Express CORS, dotenv

### AI Microservice
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **Machine Learning**: XGBoost, Scikit-learn, SHAP
- **Deep Learning & NLP**: PyTorch, HuggingFace Transformers (`ProsusAI/finbert`), Sentence-Transformers (`all-MiniLM-L6-v2`), OpenAI Whisper
- **Data Handling**: Pandas, NumPy, python-multipart

### Database
- **Primary Datastore**: MongoDB 6.0+ (Single-node replica or standalone)

---

## 📁 Repository Structure

```
banking-ai-early-warning/
├── ai-service/                   # Python FastAPI AI Microservice
│   ├── main.py                   # FastAPI app definition & endpoint routing
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # AI service container definition
│   ├── services/                 # AI microservice modules
│   │   ├── xgboost_service.py    # XGBoost default probability & TreeSHAP
│   │   ├── sentiment_service.py  # FinBERT sentiment analysis
│   │   ├── complaint_service.py  # 8-class grievance categorization & keywords
│   │   ├── voice_service.py      # Whisper Speech-to-Text processor
│   │   ├── sbert_service.py      # SBERT semantic similarity engine
│   │   ├── anomaly_service.py    # Isolation Forest transaction outlier detector
│   │   ├── recommendation_service.py # Banking policy recommendation rules
│   │   └── whatif_service.py     # What-If scenario simulation logic
│   └── saved_models/             # Serialized model artifacts
│       ├── xgboost_model.pkl     # Trained XGBoost classifier
│       ├── scaler.pkl            # StandardScaler for tabular features
│       └── isolation_forest.pkl  # Trained Isolation Forest model
├── backend/                      # Node.js + Express Backend
│   ├── server.js                 # Entry point, middleware, DB initialization
│   ├── package.json              # Backend dependencies & scripts
│   ├── Dockerfile                # Backend container definition
│   ├── .env.example              # Environment variables template
│   ├── seed.js                   # Seed script generating realistic synthetic data
│   ├── config/
│   │   └── db.js                 # Reusable non-blocking Mongoose connection module
│   ├── models/                   # Mongoose schemas
│   │   ├── Customer.js           # Demographic & financial profile
│   │   ├── Loan.js               # Repayment, EMI, overdue status
│   │   ├── Transaction.js        # Spending stream with anomaly flags
│   │   ├── Complaint.js          # Grievance with NLP & SBERT metadata
│   │   ├── VoiceTranscript.js    # Whisper transcribed audio records
│   │   ├── BankingEvent.js       # Core banking audit trail
│   │   ├── RiskEvent.js          # Historical risk scores, signals, actions
│   │   └── WhatIfScenario.js     # User-simulated scenario comparison logs
│   ├── routes/                   # RESTful API route definitions
│   │   ├── customerRoutes.js     # Customer profile & voice routes
│   │   ├── riskRoutes.js         # Current risk & historical risk evaluations
│   │   ├── eventRoutes.js        # Audit trail & timeline retrieval
│   │   ├── simulationRoutes.js   # EMI, complaint, and transaction triggers
│   │   └── whatIfRoutes.js       # What-If scenario submission & history
│   ├── controllers/              # Route controllers
│   └── services/                 # Business logic & microservice clients
│       ├── aiService.js          # HTTP bridge to FastAPI (:8000)
│       └── featureService.js     # Aggregates MongoDB documents into ML vector
├── frontend/                     # React 18 + Vite Web Application
│   ├── index.html                # HTML entry point with Inter typography
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Dark-mode theme configuration
│   ├── src/
│   │   ├── main.jsx              # React root mount
│   │   ├── App.jsx               # App shell, Navbar, & Route definitions
│   │   ├── index.css             # Design tokens, Tailwind directives, glassmorphism
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx        # Navigation bar with live system status badge
│   │   │   ├── RiskBadge.jsx     # Low / Medium / High / Critical badges
│   │   │   ├── RiskAlertBanner.jsx # Prominent banner for High/Critical borrowers
│   │   │   ├── RiskScoreCard.jsx # Probability gauge, score, & model status
│   │   │   ├── RiskSignalCard.jsx# SHAP feature attributions with direction
│   │   │   ├── SentimentCard.jsx # Grievances & Whisper voice call transcripts
│   │   │   ├── AnomalyCard.jsx   # Isolation Forest spending outlier stream
│   │   │   ├── RecommendationCard.jsx # Prioritized non-autonomous interventions
│   │   │   ├── EventTimeline.jsx # Immutable chronological audit ledger
│   │   │   ├── WhatIfCard.jsx    # Interactive scenario workbench & comparison
│   │   │   ├── SimulationModal.jsx # In-app EMI/Complaint simulation dialog
│   │   │   └── StateFeedback.jsx # Loading, Error, Empty, and Offline states
│   │   ├── pages/                # Application views
│   │   │   ├── Dashboard.jsx     # Executive portfolio overview & customer list
│   │   │   └── CustomerDetails.jsx # Comprehensive borrower risk workbench
│   │   ├── services/
│   │   │   └── api.js            # Axios client with fallback configuration
│   │   ├── hooks/
│   │   │   ├── useCustomers.js   # Customer list state with auto-polling
│   │   │   └── useCustomerRisk.js# Deep-dive risk & history synchronization
│   │   └── utils/
│   │       └── riskUtils.js      # Financial formatters (USD, INR, timestamps)
├── data/                         # Test fixtures & training datasets
│   └── test_customer_call.wav    # Sample telephony audio recording for Whisper
├── docker-compose.yml            # Multi-container local deployment spec
└── README.md                     # Comprehensive system documentation
```

---

## 📋 Prerequisites & System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **Node.js**: `v18.0.0` or later
- **Python**: `3.10.x` or `3.11.x`
- **MongoDB**: `v6.0+` running on `mongodb://127.0.0.1:27017`
- **RAM**: Minimum 8 GB (16 GB recommended for local deep learning inference)
- **Disk Space**: ~3 GB free for PyTorch, HuggingFace models, and Whisper weights

---

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/banking-ai-early-warning.git
cd banking-ai-early-warning
```

### 2. MongoDB Setup
Ensure a MongoDB instance is running on default port `27017`:
```powershell
# Windows PowerShell
net start MongoDB

# Linux / macOS
sudo systemctl start mongod
```

### 3. Python AI Microservice Setup
```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
cd ..
```

### 4. Node.js Backend Setup
```bash
cd backend
npm install
cd ..
```

### 5. React Frontend Setup
```bash
cd frontend
npm install
cd ..
```

### 6. Seed Database with Synthetic Banking Data
Seed 10 diverse retail borrowers, active loans, transaction streams, and grievance complaints:
```bash
cd backend
npm run seed
cd ..
```
*Console output will confirm: `Database seeded successfully`.*

---

## 🔑 Environment Variables

Create `.env` files in their respective folders using the templates below:

### `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/banking_ai
AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

### `ai-service/.env`
```env
PORT=8000
HOST=0.0.0.0
ENV=development
BACKEND_URL=http://localhost:5000/api
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

---

## 🧠 Machine Learning Models & Training

The pre-trained model artifacts are pre-bundled in `ai-service/saved_models/`:
- `xgboost_model.pkl`: XGBoost binary classifier (Default vs Non-Default within 90 days)
- `scaler.pkl`: StandardScaler fitted on 10 tabular risk features
- `isolation_forest.pkl`: Unsupervised Isolation Forest for transaction volume/velocity anomalies

### Tabular Feature Specification (10 Features)
1. `credit_score` (300–850)
2. `monthly_income` (Monthly borrower gross income)
3. `loan_amount` (Original sanction principal)
4. `monthly_emi` (Scheduled monthly repayment amount)
5. `overdue_amount` (Cumulative unpaid past-due amount)
6. `payment_delay_count` (Consecutive missed or delayed EMIs)
7. `savings_balance` (Liquid deposit balance)
8. `complaint_count` (Historical grievances filed)
9. `negative_sentiment_score` (FinBERT negative probability 0.0–1.0)
10. `transaction_anomaly_count` (Outlier transactions detected by Isolation Forest)

*(Optional) To retrain the tabular models locally:*
```bash
cd ai-service
python train_models.py
```

---

## 🚀 Starting the Application

For demo execution, launch four terminal windows:

### Terminal 1: MongoDB Service
Ensure MongoDB is running on port `27017`.

### Terminal 2: FastAPI AI Microservice (Port 8000)
```bash
cd ai-service
# Activate venv if applicable
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
- Health Check: `http://localhost:8000/health`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### Terminal 3: Node.js Express Backend (Port 5000)
```bash
cd backend
node server.js
```
- Health Check: `http://localhost:5000/api/health`

### Terminal 4: React Vite Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🐳 Docker Deployment

The system is fully containerized using Docker Compose:

```bash
# Build and run all services in the background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Teardown
docker-compose down -v
```

Services are exposed as:
- **Frontend Dashboard**: `http://localhost:5173`
- **Node.js Backend**: `http://localhost:5000`
- **FastAPI AI Service**: `http://localhost:8000`
- **MongoDB**: `localhost:27017`

---

## 🌐 Complete API Reference

### 1. Python FastAPI AI Service (`:8000`)

| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Microservice liveness and loaded model check |
| `POST` | `/predict/default-risk` | XGBoost default prediction + TreeSHAP feature attributions |
| `POST` | `/analyze/sentiment` | FinBERT financial sentiment distribution (`positive`, `negative`, `neutral`) |
| `POST` | `/analyze/complaint` | Grievance categorization (8 classes), severity scoring, keyword extraction |
| `POST` | `/analyze/voice` | Whisper Speech-to-Text transcription with cascaded NLP classification |
| `POST` | `/detect/recurring-issue` | SBERT cosine similarity comparison against historical grievances |
| `POST` | `/detect/transaction-anomaly` | Isolation Forest behavioral outlier scoring |
| `POST` | `/analyze/customer-risk` | Unified intelligence pipeline (XGBoost + SHAP + Recommendations + Anomalies) |
| `POST` | `/what-if/default-risk` | What-If scenario re-scoring with baseline vs simulated delta |

### 2. Node.js Express Backend (`:5000`)

| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Composite health check (Backend + Mongo + AI microservice) |
| `GET` | `/api/customers` | List all customer profiles with real-time risk scores |
| `GET` | `/api/customers/:id` | Full borrower dossier (demographics, loan, txns, grievances, voice) |
| `GET` | `/api/risk/:id` | Latest evaluated risk state, SHAP signals, recommendations |
| `GET` | `/api/risk/history/:id`| Historical time-series of risk score evaluations |
| `GET` | `/api/events/customer/:id` | Chronological immutable banking event ledger |
| `POST` | `/api/simulate/emi-failure/:id` | Triggers missed EMI, increments delay count, recomputes risk |
| `POST` | `/api/simulate/complaint/:id` | Submits grievance, runs FinBERT & SBERT, cascades risk update |
| `POST` | `/api/customers/:id/voice` | Ingests telephony `.wav`, transcribes via Whisper, updates risk |
| `POST` | `/api/simulate/transaction/:id`| Ingests spending event, tests with Isolation Forest, logs event |
| `POST` | `/api/what-if/default-risk` | Simulates scenario, returns baseline vs new risk, persists record |
| `GET` | `/api/what-if/:customerId` | Retrieves past What-If scenario simulations for the customer |

---

## 🔮 What-If Decision Intelligence Simulator

The **What-If Decision Intelligence** module enables risk managers to simulate operational interventions without modifying core banking records.

### Allowed Modifiable Parameters
- `credit_score` (300 to 850)
- `overdue_amount` (>= $0)
- `payment_delay_count` (>= 0)
- `monthly_income` (> $0)
- `monthly_emi` (> $0)
- `complaint_count` (>= 0)

### Pre-Configured Action Presets
1. **Full Overdue Clearance**: Sets `overdue_amount = 0` and `payment_delay_count = 0`.
2. **50% Debt Restructuring**: Cuts `overdue_amount` by 50% and reduces `monthly_emi` by 25%.
3. **Credit Improvement (+40 pts)**: Simulates credit score improvement from external settlements.
4. **Income Growth (+20%)**: Evaluates borrower capacity following salary raises.

### Interactive Visualizations
- **Comparison Cards**: Immediate side-by-side view of Baseline vs Simulated Risk Score, Level, and Default Probability.
- **Delta Badge**: Shows exact percentage point variance (e.g., `-34%` reduction).
- **Comparative Bar Chart**: Visual Recharts bar comparing Baseline vs Simulated metrics.
- **Dynamic Risk Signal Comparison**: Visualizes which SHAP features decreased or increased under the hypothetical scenario.
- **Simulation Audit History**: Logs every simulation run with timestamp and parameter delta.

---

## 🧪 End-to-End Hackathon Demo Walkthrough (Customer C001)

Follow this script to demonstrate the system's reactive early warning capabilities live:

### 1. Initial State (Clean Standing)
- Navigate to `http://localhost:5173`.
- Select customer **`C001` (Aarav Patel)**.
- Observe:
  - Risk Level: **LOW** (Risk Score ~5, Default Probability ~5%)
  - Overdue Amount: **$0**, Delay Count: **0**
  - FinBERT Grievance Sentiment: None / Neutral
  - Recommendations: `"Maintain standard monitoring"`

### 2. Inject 1st Missed EMI
- Click **"Simulate Event"** > **"Simulate EMI Failure"**.
- Or via terminal:
  ```bash
  curl -X POST http://localhost:5000/api/simulate/emi-failure/C001
  ```
- **Result**:
  - Overdue amount becomes **$12,000**, delay count becomes **1**.
  - Risk Score escalates to **MEDIUM (~35)**.
  - Event Ledger adds `EMI_PAYMENT_FAILED` entry.

### 3. Inject 2nd Consecutive Missed EMI
- Trigger another EMI failure:
  ```bash
  curl -X POST http://localhost:5000/api/simulate/emi-failure/C001
  ```
- **Result**:
  - Overdue amount reaches **$24,000**, delay count reaches **2**.
  - Risk Score escalates to **CRITICAL (>75)**.
  - **`RiskAlertBanner`** appears prominently at the top of the borrower profile:
    - Lists critical risk factors: `"High payment delays"`, `"Elevated overdue debt"`.
    - Surfaces urgent recommendations: `"Contact customer for early repayment assistance"`.
  - SHAP feature attributions show `payment_delay_count` and `overdue_amount` dominating default probability.

### 4. Submit Customer Grievance (FinBERT Sentiment)
- Click **"Simulate Complaint"** and enter:
  > *"I am extremely frustrated. My EMI was deducted twice and support has not responded. I cannot pay next month."*
- **Result**:
  - FinBERT analyzes text: `sentiment: negative (0.96)`, category `PAYMENT_FAILURE`, severity `HIGH`.
  - Grievance card updates in real-time with negative sentiment badge and extracted keywords.
  - Risk score rises further (~82).

### 5. Submit Repeated Grievance (SBERT Similarity)
- Submit a related complaint:
  > *"My payment issue is still not resolved by customer service and penalty was applied."*
- **Result**:
  - Sentence-BERT matches against previous complaint: `is_recurring: true`, `similarity_score: 0.89`.
  - Recommendation engine fires: `"Prioritize pending customer complaints"`.

### 6. Ingest Customer Call Recording (Whisper Speech-to-Text)
- Upload telephony audio recording via the customer endpoint:
  ```bash
  curl -X POST http://localhost:5000/api/customers/C001/voice \
    -F "audio=@data/test_customer_call.wav"
  ```
- **Result**:
  - OpenAI Whisper transcribes call: *"My Emmy payment failed twice and support has not solved the problem."*
  - Cascaded through FinBERT and categorized under `PAYMENT_FAILURE`.
  - Rendered in the **Voice Intelligence** tab of the Customer Details page.

### 7. Run What-If Scenario Simulation
- Scroll down to the **What-If Decision Intelligence Workbench**.
- Click the **"50% Debt Restructuring"** preset (or drag sliders to set `overdue_amount = 0`).
- Click **"Run What-If Simulation"**.
- **Result**:
  - Estimated risk drops from **82 (CRITICAL)** to **~28 (LOW/MEDIUM)**.
  - Recharts comparison chart displays the simulated drop.
  - Scenario is saved to the customer's simulation history.

---

## 🧪 Testing & Verification Suites

The repository contains automated end-to-end verification scripts covering all modules:

### 1. Regression Verification (Step 4)
Verifies FinBERT, Whisper STT, SBERT similarity, XGBoost, and recommendation rules:
```bash
python verify_step4.py
```

### 2. What-If Module Verification (Step 6)
Verifies input validation, FastAPI re-scoring, Express route forwarding, and MongoDB scenario persistence:
```bash
python verify_step6.py
```

### 3. Full API Endpoints Verification (Step 7)
Tests all 16+ API endpoints across FastAPI (:8000) and Express (:5000):
```bash
python verify_all_endpoints.py
```

### 4. End-to-End Demo Lifecycle Verification (Step 7)
Runs complete non-destructive C001 demonstration lifecycle:
```bash
python verify_final_demo.py
```

---

## 🛡️ Decision-Support & Governance Principles

This platform operates strictly under **human-in-the-loop decision-support governance**:

1. **Advisory Decision Support Only**:
   - Model outputs are advisory insights designed to assist credit officers and risk managers.
   - The system **never** autonomously freezes accounts, cancels credit lines, or initiates collections.
2. **Probabilistic & Objective Phrasing**:
   - Outputs are framed as:
     - *"Model-based scenario estimate"*
     - *"Estimated default risk: X%"*
     - *"Important risk signals"*
     - *"Recommended supervisory action"*
   - The system **never** guarantees future customer behavior (e.g., avoids *"this action will prevent default"*).
3. **Mathematical Attribution vs Causal Reality**:
   - SHAP values quantify additive mathematical attributions of features in the XGBoost tree ensemble; they do not imply real-world causality.
4. **Behavioral Outlier Classification**:
   - Transactions flagged by Isolation Forest indicate deviations from baseline statistical spending patterns; they are marked as **anomalies for review**, not confirmed fraud.

---

## 🔧 Troubleshooting

### 1. Socket Collision / Address in Use (`EADDRINUSE` / `WinError 10048`)
If port `5000`, `8000`, or `5173` is already bound by an orphaned process:
```powershell
# In Windows PowerShell:
Get-NetTCPConnection -LocalPort 5000,8000,5173 | Select-Object OwningProcess,LocalPort
taskkill /F /PID <OwningProcessId>
```

### 2. CPU Inference Latency
Loading deep transformer models (`ProsusAI/finbert`, `sentence-transformers/all-MiniLM-L6-v2`, and `openai-whisper`) on CPU during cold-start takes 5–12 seconds. Automated verification scripts should maintain HTTP request timeouts of **>= 40 seconds**.

### 3. MongoDB Connection Timeout
Ensure MongoDB service is running on `127.0.0.1:27017`:
```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
```
If connection fails, start MongoDB with `net start MongoDB` or check logs in your MongoDB data folder.

### 4. Audio Transcription Fallback
`voice_service.py` includes a native `.wav` PCM decoder fallback if `ffmpeg` is not present in the local system PATH. For production deployments with compressed audio (MP3/OGG/AAC), install `ffmpeg`.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
