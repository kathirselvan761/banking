# AI-Powered Early Warning & Decision Intelligence System for Banking

> **24-Hour Hackathon Starter Project**  
> A proactive, multi-agent financial risk intelligence platform designed to detect loan delinquency weeks before first default, flag transaction anomalies, analyze customer grievances via FinBERT sentiment, and prescribe actionable mitigations.

---

## 🏗️ Architecture Overview

The system is structured as three decoupled, independently runnable services:

1. **Frontend (`frontend/`)**: React.js 18 + Vite + Tailwind CSS + Recharts + Axios
2. **Backend API (`backend/`)**: Node.js + Express.js + MongoDB/Mongoose
3. **AI & Decision Intelligence (`ai-service/`)**: Python 3.10+ + FastAPI + Scikit-learn + XGBoost + SHAP + Transformers + Whisper

```
                               ┌─────────────────────────┐
                               │   Frontend (React/Vite) │
                               │   http://localhost:5173 │
                               └────────────┬────────────┘
                                            │ HTTP / REST
                                            ▼
                               ┌─────────────────────────┐
                               │  Backend (Node/Express) │
                               │  http://localhost:5000  │
                               └───────┬──────────┬──────┘
                                       │          │
                     Mongoose / MongoDB│          │ HTTP (Axios Proxy)
                                       ▼          ▼
                        ┌──────────────────┐  ┌─────────────────────────┐
                        │ MongoDB Database │  │ AI Service (FastAPI)    │
                        │ Port: 27017      │  │ http://localhost:8000  │
                        └──────────────────┘  └───────────┬─────────────┘
                                                          │
                                         ┌────────────────┴───────────────┐
                                         │  Multi-Agent Decision Engine   │
                                         │  - Risk Agent (XGBoost)        │
                                         │  - Prediction Agent (PD / DPD) │
                                         │  - Explanation Agent (SHAP)    │
                                         │  - Recommendation Agent        │
                                         │  - What-If Simulation Agent    │
                                         │  - FinBERT NLP & Whisper Voice │
                                         └────────────────────────────────┘
```

---

## 📂 Project Structure

```text
banking-ai-early-warning/
│
├── frontend/                     # React.js + Vite + Tailwind CSS client
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable UI components (Header, AgentCard, etc.)
│   │   ├── pages/                # Page views (Dashboard, Borrower Profile, etc.)
│   │   ├── services/             # Axios API clients for Backend & AI Service
│   │   ├── hooks/                # Custom React hooks (useHealthCheck)
│   │   ├── utils/                # Formatting & utility functions
│   │   ├── App.jsx               # Root application component
│   │   ├── index.css             # Tailwind CSS directives & theme styles
│   │   └── main.jsx              # Vite application entrypoint
│   ├── .env.example              # Frontend environment template
│   ├── Dockerfile                # Frontend container definition
│   ├── index.html                # HTML template with Inter font
│   ├── package.json              # Frontend npm dependencies
│   ├── postcss.config.js         # PostCSS configuration for Tailwind
│   ├── tailwind.config.js        # Tailwind CSS theme & tokens
│   └── vite.config.js            # Vite build & dev server configuration
│
├── backend/                      # Node.js + Express.js API server
│   ├── controllers/              # Route controllers (health, customer, risk)
│   │   ├── healthController.js   # Health check handler
│   │   ├── customerController.js # Customer portfolio handler stub
│   │   └── riskController.js     # Early warning risk trigger handler stub
│   ├── routes/                   # Express route definitions
│   │   ├── healthRoutes.js       # /api/health endpoint
│   │   ├── customerRoutes.js     # /api/customers endpoints
│   │   └── riskRoutes.js         # /api/risks endpoints
│   ├── models/                   # Mongoose database schemas
│   │   ├── Customer.js           # Customer profile & risk status model
│   │   ├── Loan.js               # Loan facility & delinquency tracking model
│   │   └── Alert.js              # Early warning risk alert model
│   ├── middleware/               # Express middleware (error & 404 handlers)
│   │   └── errorMiddleware.js
│   ├── services/                 # Business logic & upstream microservice proxies
│   │   └── aiClientService.js    # Axios client for FastAPI communication
│   ├── utils/                    # Shared backend utilities
│   │   ├── db.js                 # Non-blocking MongoDB connection
│   │   └── logger.js             # Formatted terminal logger
│   ├── .env.example              # Backend environment template
│   ├── Dockerfile                # Backend container definition
│   ├── package.json              # Backend npm dependencies
│   └── server.js                 # Express server entrypoint
│
├── ai-service/                   # Python + FastAPI decision intelligence service
│   ├── agents/                   # Modular decision intelligence agents
│   │   ├── __init__.py           # Agent package documentation
│   │   ├── risk_agent.py         # Composite risk & early warning scoring
│   │   ├── prediction_agent.py   # DPD & default probability forecasting
│   │   ├── explanation_agent.py  # SHAP feature attribution & audit narrative
│   │   ├── recommendation_agent.py # Restructuring & proactive interventions
│   │   └── whatif_agent.py       # Stress testing & counterfactual simulations
│   ├── models/                   # ML / statistical model wrappers
│   │   ├── __init__.py           # Models package documentation
│   │   ├── risk_model.py         # Supervised tabular classifier (XGBoost stub)
│   │   ├── prediction_model.py   # Time-to-default regression stub
│   │   └── anomaly_model.py      # Unsupervised transaction anomaly detector
│   ├── services/                 # Supporting intelligence pipelines
│   │   ├── __init__.py           # Services package documentation
│   │   ├── nlp_service.py        # FinBERT sentiment analysis on complaints
│   │   ├── voice_service.py      # OpenAI Whisper speech-to-text pipeline
│   │   └── feature_service.py    # Multi-source feature vector aggregator
│   ├── utils/                    # AI service utilities
│   │   ├── __init__.py
│   │   └── config.py             # Pydantic / dotenv environment settings
│   ├── .env.example              # AI Service environment template
│   ├── Dockerfile                # AI Service container definition
│   ├── main.py                   # FastAPI application & /health endpoint
│   └── requirements.txt          # Python ML/NLP/STT dependencies
│
├── data/                         # Sample banking datasets for training & demos
│   ├── customers.csv             # Demographics, income, credit scores
│   ├── loans.csv                 # Loan balances, interest rates, DPD, status
│   ├── transactions.csv          # Cashflows, debits, anomaly flags
│   └── complaints.csv            # Customer grievances for FinBERT NLP
│
├── .gitignore                    # Git ignore for Node, Python, models, logs
├── docker-compose.yml            # Multi-service local orchestrator
└── README.md                     # Project documentation & run guide
```

---

## ⚡ Quick Start: Prerequisites

- **Node.js**: v18.0+ or v20+ (`node -v`)
- **npm**: v9.0+ (`npm -v`)
- **Python**: v3.10+ or v3.11+ (`python --version`)
- *(Optional)* **MongoDB**: Local MongoDB community server or MongoDB Atlas
- *(Optional)* **Docker & Docker Compose**: For containerized single-command execution

---

## 📦 Step 1: Install Dependencies

Open 3 terminal tabs to install dependencies for each service:

### 1. Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Backend Dependencies
```bash
cd backend
npm install
```

### 3. AI Service Dependencies
```bash
cd ai-service

# Create a Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt
```

---

## ⚙️ Step 2: Environment Variables Setup

Create `.env` files from the provided templates:

### Backend:
```bash
cd backend
# Windows:
copy .env.example .env
# macOS/Linux:
# cp .env.example .env
```
Default `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/banking_early_warning
AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

### AI Service:
```bash
cd ai-service
# Windows:
copy .env.example .env
# macOS/Linux:
# cp .env.example .env
```
Default `ai-service/.env`:
```env
PORT=8000
HOST=0.0.0.0
ENV=development
BACKEND_URL=http://localhost:5000/api
```

### Frontend:
```bash
cd frontend
# Windows:
copy .env.example .env
# macOS/Linux:
# cp .env.example .env
```
Default `frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:8000
```

---

## 🚀 Step 3: Running the Services Independently

Each service can run independently without depending on the others being active.

### 1. Run AI Service (FastAPI)
```bash
cd ai-service
# (Ensure your venv is activated if created)
uvicorn main:app --reload --port 8000 --host 0.0.0.0
```
- **Service URL**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### 2. Run Backend (Node.js + Express)
```bash
cd backend
npm run dev
# or: npm start
```
*Note: If MongoDB is not running locally, the server logs a notice and continues running in standalone mode.*
- **Backend URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### 3. Run Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
- **Frontend Dashboard**: `http://localhost:5173`

---

## 🐳 Alternative: Run Everything with Docker Compose

To start MongoDB, Backend, AI Service, and Frontend with a single command:

```bash
docker compose up --build
```

---

## 🩺 API Health-Check Endpoints

| Service | Protocol / Method | Health URL | Expected Status |
|---|---|---|---|
| **Node Backend** | `GET` | `http://localhost:5000/api/health` | `200 OK` (`{"status":"healthy", ...}`) |
| **FastAPI AI Service** | `GET` | `http://localhost:8000/health` | `200 OK` (`{"status":"healthy", ...}`) |
| **FastAPI Docs** | `GET` | `http://localhost:8000/docs` | Interactive OpenAPI Swagger UI |
| **Frontend Web UI** | `GET` | `http://localhost:5173` | Interactive Dashboard with live status |

---

## 🧠 AI Agent Roadmap (Upcoming Hackathon Phases)

1. **Risk Agent (`ai-service/agents/risk_agent.py`)**  
   Train XGBoost classifier on `data/customers.csv` and `data/loans.csv` to compute borrower risk ratings.
2. **Prediction Agent (`ai-service/agents/prediction_agent.py`)**  
   Implement time-series / survival analysis models to predict 30-day and 60-day default probabilities.
3. **Explanation Agent (`ai-service/agents/explanation_agent.py`)**  
   Compute TreeSHAP values for risk drivers and generate clear credit committee rationales.
4. **Recommendation Agent (`ai-service/agents/recommendation_agent.py`)**  
   Rule-based & optimization policy to recommend proactive restructuring, payment holidays, or RM contact.
5. **What-If Agent (`ai-service/agents/whatif_agent.py`)**  
   Simulation harness allowing credit managers to test macroeconomic interest rate / inflation shocks.
