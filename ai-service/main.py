"""
Banking AI Early Warning & Decision Intelligence Service
========================================================
Main FastAPI application entrypoint.
Provides RESTful endpoints for multi-agent risk intelligence, health checks, and simulations.
"""

from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from utils.config import settings

# Initialize FastAPI Application
app = FastAPI(
    title="Banking AI Early Warning & Decision Intelligence Service",
    description="Multi-agent AI service for credit risk scoring, delinquency prediction, explainability, and proactive interventions.",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Health Check Endpoint (Required for Hackathon Readiness)
# ------------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for container orchestrators, API gateways, and monitoring.
    URL: GET /health
    """
    return {
        "status": "healthy",
        "service": "banking-ai-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.ENV,
        "agents_available": [
            "RiskAgent",
            "PredictionAgent",
            "ExplanationAgent",
            "RecommendationAgent",
            "WhatIfAgent"
        ],
        "models_available": [
            "RiskModel",
            "PredictionModel",
            "AnomalyModel"
        ]
    }

@app.get("/", tags=["System"])
async def root():
    """Root endpoint with service overview and links."""
    return {
        "message": "AI-Powered Early Warning & Decision Intelligence System - AI Service",
        "health_check": "/health",
        "interactive_docs": "/docs",
        "status": "operational"
    }

# ------------------------------------------------------------------------------
# Agent Endpoint Scaffolding (Modular Stubs - To Be Implemented)
# ------------------------------------------------------------------------------
class CustomerAnalysisRequest(BaseModel):
    customer_id: str
    include_explanation: Optional[bool] = True
    include_recommendations: Optional[bool] = True

@app.post("/api/v1/agents/evaluate", tags=["Agents"])
async def evaluate_customer_risk(request: CustomerAnalysisRequest):
    """
    Orchestrated multi-agent evaluation placeholder endpoint.
    Will coordinate RiskAgent, PredictionAgent, ExplanationAgent, and RecommendationAgent.
    """
    return {
        "customer_id": request.customer_id,
        "status": "scaffolding_ready",
        "message": "Agent evaluation pipeline initialized. Implement agent logic in agents/ directory."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
