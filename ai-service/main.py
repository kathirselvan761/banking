"""
Banking AI Early Warning & Decision Intelligence Service
FastAPI application exposing ML, NLP, Voice STT, SHAP explainability, SBERT recurring issues, and Risk Orchestration endpoints.
"""

import os
import tempfile
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any

from utils.config import settings
from models.prediction_model import prediction_model
from models.anomaly_model import anomaly_model
from services.sentiment_service import sentiment_service
from services.complaint_service import complaint_service
from services.voice_service import voice_service
from services.similarity_service import similarity_service
from services.explanation_service import explanation_service
from services.whatif_service import whatif_service, run_what_if
from agents.risk_agent import risk_agent

app = FastAPI(
    title="Banking AI Early Warning ML & Intelligence Service",
    description="Full-stack AI service for default prediction, SHAP explainability, FinBERT sentiment, Whisper STT, SBERT similarity, and decision intelligence.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Pydantic Schemas
# ------------------------------------------------------------------------------
class DefaultRiskRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    credit_score: float = Field(..., description="Borrower credit score (300-850)")
    monthly_income: Optional[float] = Field(None, description="Monthly income")
    income: Optional[float] = Field(None, description="Income alias")
    loan_amount: float = Field(..., description="Principal loan amount")
    monthly_emi: float = Field(..., description="Monthly EMI repayment")
    outstanding_amount: Optional[float] = Field(0.0, description="Total outstanding principal")
    overdue_amount: Optional[float] = Field(0.0, description="Total overdue amount")
    emi_delay_count: Optional[int] = Field(0, description="Number of recent EMI delay counts")
    payment_delay_count: Optional[int] = Field(None, description="Payment delay alias")
    previous_payment_delays: Optional[int] = Field(0, description="Historical payment delay count")
    complaint_count: Optional[int] = Field(0, description="Number of customer complaints filed")
    negative_sentiment_count: Optional[int] = Field(0, description="Customer negative grievance count")
    transaction_count: Optional[int] = Field(30, description="30-day transaction frequency")
    transaction_anomaly_count: Optional[int] = Field(0, description="Number of flagged unusual transactions")

class RiskSignal(BaseModel):
    feature: str
    impact: float
    direction: str

class DefaultRiskResponse(BaseModel):
    default_probability: float
    probability: float
    risk_score: int
    risk_level: str
    important_risk_signals: List[RiskSignal]

class TransactionAnomalyRequest(BaseModel):
    amount: float = Field(..., description="Transaction monetary amount")
    transaction_count: int = Field(5, description="Daily transaction frequency")
    hour_of_day: int = Field(12, description="Hour of the day (0-23)")
    location_frequency: int = Field(1, description="Frequency of transactions at this location")
    device_frequency: int = Field(1, description="Frequency of transactions using this device")

class TransactionAnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float

class SentimentRequest(BaseModel):
    text: str = Field(..., description="Customer communication or complaint text")

class SentimentResponse(BaseModel):
    sentiment: str
    positive_score: float
    negative_score: float
    neutral_score: float

class ComplaintRequest(BaseModel):
    text: str = Field(..., description="Customer grievance text")

class ComplaintResponse(BaseModel):
    category: str
    sentiment: str
    severity: str
    keywords: List[str]

class VoiceAnalysisResponse(BaseModel):
    transcript: str
    language: str
    sentiment: str
    category: str
    severity: str
    keywords: List[str]

class RecurringIssueRequest(BaseModel):
    current_complaint: str = Field(..., description="Current customer grievance text")
    previous_complaints: List[str] = Field(default=[], description="List of past customer grievances")

class RecurringIssueResponse(BaseModel):
    is_recurring: bool
    similarity_score: float
    related_issue: str
    matched_complaint: Optional[str] = ""

class CustomerRiskAnalysisRequest(BaseModel):
    customer_id: str
    features: Dict[str, Any]
    anomalies: Optional[List[Dict[str, Any]]] = []
    sentiment_summary: Optional[Dict[str, Any]] = None

class WhatIfRequest(BaseModel):
    customer_id: Optional[str] = "C001"
    base_features: Dict[str, Any] = Field(..., description="Baseline customer risk features")
    scenario_changes: Dict[str, Any] = Field(..., description="Counterfactual feature changes to test")

class ScenarioRiskState(BaseModel):
    probability: float
    risk_score: int
    risk_level: str

class RiskDelta(BaseModel):
    percentage_points: int
    direction: str

class WhatIfResponse(BaseModel):
    customer_id: str
    original: ScenarioRiskState
    scenario: ScenarioRiskState
    change: RiskDelta
    modified_features: Dict[str, Any]

# ------------------------------------------------------------------------------
# System Health Endpoint
# ------------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health_check():
    """Service health check endpoint."""
    return {
        "status": "ok",
        "service": "banking-ai-service"
    }

# ------------------------------------------------------------------------------
# 1. Default Risk Prediction + SHAP Explainability
# ------------------------------------------------------------------------------
@app.post("/predict/default-risk", response_model=DefaultRiskResponse, tags=["Risk Prediction"])
async def predict_default_risk(req: DefaultRiskRequest):
    """
    Calculates 90-day loan default probability, prototype risk level,
    and exact SHAP feature contributions explaining the prediction.
    """
    try:
        features = req.model_dump()
        result = prediction_model.predict_default_risk(features)
        
        # Calculate SHAP feature attributions
        try:
            signals = explanation_service.explain_prediction(features, top_k=4)
        except Exception as xai_err:
            print(f"[WARN] SHAP attribution fallback: {xai_err}")
            signals = []

        prob = result["default_probability"]
        return {
            "default_probability": prob,
            "probability": prob,  # Compatible with Step 4 schema requirements
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "important_risk_signals": signals
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# ------------------------------------------------------------------------------
# 2. Transaction Anomaly Detection
# ------------------------------------------------------------------------------
@app.post("/detect/transaction-anomaly", response_model=TransactionAnomalyResponse, tags=["Anomaly Detection"])
async def detect_transaction_anomaly(req: TransactionAnomalyRequest):
    """
    Evaluates transaction behavior with Isolation Forest to flag unusual outflows.
    """
    try:
        tx_data = req.model_dump()
        result = anomaly_model.detect_anomaly(tx_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")

# ------------------------------------------------------------------------------
# 3. Text Sentiment Analysis
# ------------------------------------------------------------------------------
@app.post("/analyze/sentiment", response_model=SentimentResponse, tags=["NLP & Grievances"])
async def analyze_sentiment(req: SentimentRequest):
    """
    Performs financial sentiment analysis on customer text.
    POST /analyze/sentiment
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    try:
        return sentiment_service.analyze_sentiment(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis error: {str(e)}")

# ------------------------------------------------------------------------------
# 4. Complaint Analysis Pipeline
# ------------------------------------------------------------------------------
@app.post("/analyze/complaint", response_model=ComplaintResponse, tags=["NLP & Grievances"])
async def analyze_complaint(req: ComplaintRequest):
    """
    Classifies complaint text into categories, extracts severity, keywords, and sentiment.
    POST /analyze/complaint
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty.")
    try:
        return complaint_service.analyze_complaint(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Complaint analysis error: {str(e)}")

# ------------------------------------------------------------------------------
# 5. SBERT Recurring Issue Detection
# ------------------------------------------------------------------------------
@app.post("/detect/recurring-issue", response_model=RecurringIssueResponse, tags=["NLP & Grievances"])
async def detect_recurring_issue(req: RecurringIssueRequest):
    """
    Compares a new complaint with previous complaints using Sentence-BERT to identify recurring issues.
    POST /detect/recurring-issue
    """
    if not req.current_complaint or not req.current_complaint.strip():
        raise HTTPException(status_code=400, detail="Current complaint text cannot be empty.")
    try:
        return similarity_service.detect_recurring_issue(
            current_complaint=req.current_complaint,
            previous_complaints=req.previous_complaints
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recurring issue detection error: {str(e)}")

# ------------------------------------------------------------------------------
# 6. Voice Speech-to-Text with Whisper
# ------------------------------------------------------------------------------
@app.post("/analyze/voice", response_model=VoiceAnalysisResponse, tags=["Voice STT"])
async def analyze_voice(file: UploadFile = File(...)):
    """
    Transcribes uploaded customer call recording via Whisper and processes transcript.
    POST /analyze/voice
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Valid audio file is required.")

    # Save uploaded bytes to a temporary audio file
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    temp_audio_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            if len(contents) == 0:
                raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")
            tmp.write(contents)
            temp_audio_path = tmp.name

        # Process through Whisper & Complaint NLP pipeline
        result = voice_service.process_audio(temp_audio_path)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice STT processing error: {str(e)}")
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except Exception:
                pass

# ------------------------------------------------------------------------------
# 7. Unified Customer Risk Intelligence
# ------------------------------------------------------------------------------
@app.post("/analyze/customer-risk", tags=["Decision Intelligence"])
async def analyze_customer_risk(req: CustomerRiskAnalysisRequest):
    """
    Orchestrates XGBoost, SHAP explainability, sentiment summaries, and recommendations.
    POST /analyze/customer-risk
    """
    try:
        result = risk_agent.evaluate_unified_risk(
            customer_id=req.customer_id,
            features=req.features,
            anomalies=req.anomalies,
            sentiment_summary=req.sentiment_summary
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Customer risk evaluation error: {str(e)}")

# ------------------------------------------------------------------------------
# 8. What-If Decision Intelligence & Counterfactual Stress Testing
# ------------------------------------------------------------------------------
@app.post("/what-if/default-risk", response_model=WhatIfResponse, tags=["What-If Simulation"])
async def evaluate_what_if(req: WhatIfRequest):
    """
    Simulates counterfactual customer risk scenarios without modifying baseline database state.
    POST /what-if/default-risk
    """
    try:
        result = run_what_if(req.base_features, req.scenario_changes)
        return {
            "customer_id": req.customer_id or "UNKNOWN",
            "original": result["original"],
            "scenario": result["scenario"],
            "change": result["change"],
            "modified_features": result["modified_features"]
        }
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"What-If evaluation error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
