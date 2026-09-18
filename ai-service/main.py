"""
Banking AI Early Warning & Decision Intelligence Service
FastAPI application exposing ML endpoints for default risk prediction and anomaly detection.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from utils.config import settings
from models.prediction_model import prediction_model
from models.anomaly_model import anomaly_model

app = FastAPI(
    title="Banking AI Early Warning ML Service",
    description="Realtime ML inference API for loan delinquency early warning and transaction anomaly detection.",
    version="1.0.0"
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
    credit_score: float = Field(..., description="Borrower credit score (300-850)")
    monthly_income: float = Field(..., description="Monthly income")
    loan_amount: float = Field(..., description="Principal loan amount")
    monthly_emi: float = Field(..., description="Monthly EMI repayment")
    outstanding_amount: float = Field(..., description="Total outstanding principal")
    overdue_amount: float = Field(0.0, description="Total overdue amount")
    emi_delay_count: int = Field(0, description="Number of recent EMI delay counts")
    previous_payment_delays: int = Field(0, description="Historical payment delay count")
    complaint_count: int = Field(0, description="Number of customer complaints filed")
    negative_sentiment_count: int = Field(0, description="Customer negative grievance count")
    transaction_count: int = Field(30, description="30-day transaction frequency")
    transaction_anomaly_count: int = Field(0, description="Number of flagged unusual transactions")

class DefaultRiskResponse(BaseModel):
    default_probability: float
    risk_score: int
    risk_level: str

class TransactionAnomalyRequest(BaseModel):
    amount: float = Field(..., description="Transaction monetary amount")
    transaction_count: int = Field(5, description="Daily transaction frequency")
    hour_of_day: int = Field(12, description="Hour of the day (0-23)")
    location_frequency: int = Field(1, description="Frequency of transactions at this location")
    device_frequency: int = Field(1, description="Frequency of transactions using this device")

class TransactionAnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float

# ------------------------------------------------------------------------------
# Health Check Endpoint
# ------------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health_check():
    """
    Service health check endpoint.
    GET /health
    """
    return {
        "status": "ok",
        "service": "banking-ai-service"
    }

# ------------------------------------------------------------------------------
# ML Endpoints
# ------------------------------------------------------------------------------
@app.post("/predict/default-risk", response_model=DefaultRiskResponse, tags=["Risk Prediction"])
async def predict_default_risk(req: DefaultRiskRequest):
    """
    Calculates 90-day loan default probability and risk level using trained XGBoost model.
    POST /predict/default-risk
    """
    try:
        features = req.model_dump()
        result = prediction_model.predict_default_risk(features)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/detect/transaction-anomaly", response_model=TransactionAnomalyResponse, tags=["Anomaly Detection"])
async def detect_transaction_anomaly(req: TransactionAnomalyRequest):
    """
    Evaluates transaction patterns using Isolation Forest to detect anomalous behavior.
    POST /detect/transaction-anomaly
    """
    try:
        tx_data = req.model_dump()
        result = anomaly_model.detect_anomaly(tx_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
