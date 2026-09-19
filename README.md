# AI-Powered Early Warning & Decision Intelligence System

> **Domain**: Banking & Financial Credit Risk Intelligence  
> **Architecture**: FastAPI Orchestration &bull; Whisper STT &bull; FinBERT &bull; Sentence-BERT &bull; Isolation Forest &bull; K-Means &bull; XGBoost &bull; SHAP &bull; LangGraph Agentic Loop with Tools &bull; React Dashboard

---

## 🏛️ System Architecture

```
                       BANKING DATA SOURCES
(Email, Phone Voice Audio, Feedback/Complaints, Transactions, Loans, System Logs)
                                 ↓
                        1. DATA INGESTION
    (POST /api/ingest/{email, audio, feedback, transaction, loan, system-log})
                                 ↓
                         2. VALIDATION
                                 ↓
                        3. PREPROCESSING
   (Schema validation, missing value imputation, cleaning, text/numeric normalization)
                                 ↓
                     4. WHISPER / NLP / ML
        ┌───────────────────┬───────────────────┬───────────────────┐
      AUDIO                TEXT             STRUCTURED          SYSTEM LOGS
        ↓                   ↓                   ↓                   ↓
     Whisper             FinBERT         Isolation Forest       Trend Analysis
        ↓              (Sentiment)        (Tx Anomalies)        Failure Pattern
    Transcript              ↓                   ↓                  Detection
        ↓              Sentence-BERT         K-Means
    Text Cleaning   (Recurring Issues &   (Segmentation)
        ↓            Semantic Clusters)         ↓
        └───────────────────┤                XGBoost
                            │           (Future Risk Prob)
                            │                   ↓
                            │                 SHAP
                            │            (Explainability)
                            └─────────────┬─────┘
                                          ↓
                              5. COMMON RISK PROFILE
               (Structured bridge between ML models and Agentic AI)
                                          ↓
                        6. RISK ENGINE + XGBOOST + SHAP
                 (Deterministic scoring 0-100 & SHAP Top Factors)
                                          ↓
                          7. LANGGRAPH AGENTIC LOOP
                 (Monitoring → Investigation → RCA → Prediction →
                  Explainability → Recommendation → What-If → Decision)
                                          ↓
                                  8. TOOLS
       (Data Tools, ML Tools, Scenario Tools, Alert Creation & Retrieval)
                                          ↓
               9. INVESTIGATION / RCA / RECOMMENDATION / WHAT-IF
   (Evidence sufficiency loop gathering missing data & non-causal RCA synthesis)
                                          ↓
                         10. DECISION INTELLIGENCE
            (Structured output with audit trail, factors, and alert payload)
                                          ↓
                         11. FASTAPI ORCHESTRATION
                                          ↓
                         12. REACT RISK DASHBOARD
     (Overview, Customer Risk, SHAP Explainability, SBERT Recurring Issues,
      Alerts, Agent Investigation Timeline, Interactive What-If Simulator)
                                          ↓
                           13. HUMAN DECISION
         (Final credit, restructuring, or outreach decisions remain strictly
                 with the authorized human banking officer)
```

---

## 🌟 Core Design Principles

> **"ML models perform the analysis.**  
> **Tools expose data and model capabilities.**  
> **Agentic AI decides what to investigate next.**  
> **The agent loop gathers evidence iteratively.**  
> **FastAPI orchestrates the system.**  
> **The dashboard presents explainable decision intelligence.**  
> **The human makes the final banking decision."**

---

## 🚀 Key Modules & Capabilities

### 1. Ingestion & Preprocessing Pipeline
* **Endpoints**: `/api/ingest/email`, `/api/ingest/audio`, `/api/ingest/feedback`, `/api/ingest/transaction`, `/api/ingest/loan`, `/api/ingest/system-log`
* **Validation & Cleaning**: Pydantic schema validation, ISO-8601 UTC timestamp normalization, text tag stripping, numeric clipping, and quality logging.
* **Feature Engineering**: Derives credit utilization, debt-to-income (DTI) ratio, overdue-to-principal ratio, and text urgency indicators.

### 2. Multi-Modal NLP & Speech AI
* **OpenAI Whisper**: Transcribes customer support audio calls into structured text with confidence scoring.
  * *Enforced Pipeline*: `Audio → Whisper → Transcript → Text Preprocessing → NLP`. Audio is never sent directly to NLP.
* **FinBERT Sentiment Analysis**: Evaluates customer communications for financial frustration and distress signals.
* **Sentence-BERT (SBERT)**: High-dimensional semantic cosine similarity clustering discovering recurring payment and gateway failure patterns across accounts.

### 3. Machine Learning Suite
* **Isolation Forest**: Identifies statistical transaction outliers (e.g. midnight high-value debits) without false assumptions of confirmed fraud.
* **K-Means Customer Segmentation**: Clusters behavioral centroids into semantic segments (*"Stable Active Customer"*, *"Credit Risk Pattern"*, *"High Value Customer"*, *"Dissatisfied Customer"*).
* **XGBoost Classifier**: Predicts future 90-day loan default risk probability directly from quantitative training features.
* **SHAP (Shapley Additive exPlanations)**: Delivers transparent feature attributions explaining *"Why is this borrower high risk?"*.
* **Deterministic Risk Engine**: Configurable scoring (0–25 Low, 26–50 Medium, 51–75 High, 76–100 Critical).

### 4. LangGraph Multi-Agent Investigation Loop
Autonomous iterative state graph coordinating specialized agents:
1. **Monitoring Agent**: Evaluates the Common Risk Profile and decides if formal investigation is triggered.
2. **Investigation Agent**: Queries tools iteratively (`get_customer_history`, `get_loan_history`, `get_transactions`, `get_complaints`, `get_system_events`).
3. **Evidence Sufficiency Loop**: Evaluates whether evidence is complete; if missing data remains, loops back to invoke the next tool.
4. **RCA Agent**: Synthesizes *possible contributing factors* (strictly avoiding false claims of causation from correlation).
5. **Prediction & Explainability Agent**: Executes XGBoost and SHAP tools.
6. **Recommendation Agent**: Formulates human-advisory restructuring recommendations.
7. **What-If Agent**: Simulates loan restructuring scenarios.
8. **Decision / Alert Agent**: Assembles final Decision Intelligence payload and dispatches early warning alerts.

### 5. Interactive React Dashboard
* **Overview**: Portfolio risk distribution, active alerts, anomaly counts, recurring issues, and risk trends.
* **Customer Risk**: Detailed drill-down for borrowers including primary crisis demo profile **C101 (Alex Vance)**.
* **SHAP Explainability**: Visual feature contribution waterfall charts showing positive and negative risk drivers.
* **Recurring Issues**: Semantic issue clusters discovered by Sentence-BERT with affected customer lists.
* **Risk Alerts**: Prioritized early warning queue with one-click resolution.
* **Agent Investigation**: Visual step-by-step audit trail showing tool invocations, reasoning summaries, and RCA.
* **What-If Simulator**: Real-time sliders (overdue amount, EMI delays, credit utilization, complaints) showing instant model recalculations.

---

## 🏃 Running the Application

### 1-Click Launch (Recommended)
Simply double-click:
```powershell
.\run_project.bat
```
This automatically launches:
1. **Central FastAPI Backend** on `http://localhost:5000` (Swagger UI: `http://localhost:5000/docs`)
2. **React Vite Dashboard** on `http://localhost:5173`

### Manual Execution
```powershell
# 1. Seed Database (Populates C101 and benchmark accounts)
cd backend
python seed.py

# 2. Start FastAPI Backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload

# 3. Start Frontend (in a separate terminal)
cd frontend
npm run dev
```

### Automated Integration Verification
Run the end-to-end verification test suite:
```powershell
python verify_refactored_architecture.py
```
*(Tests 18/18 checks covering all endpoints, ML models, ingestion routes, and the LangGraph loop).*
