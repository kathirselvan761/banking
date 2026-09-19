import os
import tempfile
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from app.preprocessing.pipeline import pipeline
from app.preprocessing.validator import (
    EmailIngestModel,
    FeedbackIngestModel,
    TransactionIngestModel,
    LoanProcessIngestModel,
    SystemLogIngestModel
)
from app.database.mongodb import get_collection
from app.ai.whisper_service import whisper_service
from app.ai.finbert_service import finbert_service
from app.ai.sbert_service import sbert_service
from app.services.risk_profile_service import risk_profile_service

logger = logging.getLogger("banking_ai.ingestion_router")

router = APIRouter(prefix="/api/ingest", tags=["Data Ingestion & Preprocessing"])

@router.post("/email")
async def ingest_email(payload: EmailIngestModel):
    """
    Ingest customer email.
    Flow: Email -> Preprocessing -> FinBERT Sentiment -> MongoDB Storage -> Trigger Profile Update
    """
    try:
        processed = pipeline.process_email(payload.model_dump())
        
        # NLP analysis on cleaned body
        sentiment = finbert_service.analyze_sentiment(processed["body"])
        processed["nlp_analysis"] = sentiment

        # Save to complaints / communications
        doc = {
            "customer_id": processed["customer_id"],
            "type": "EMAIL",
            "subject": processed["subject"],
            "description": processed["body"],
            "sentiment": sentiment["sentiment"],
            "sentiment_score": sentiment["confidence"],
            "channel": "EMAIL",
            "timestamp": processed["timestamp"],
            "preprocessing": processed["preprocessing_metadata"]
        }
        res = get_collection("complaints").insert_one(doc)
        doc["_id"] = str(res.inserted_id)

        # Trigger updated risk profile computation
        risk_profile_service.build_common_risk_profile(processed["customer_id"])

        return {
            "status": "SUCCESS",
            "message": "Email ingested, validated, preprocessed and analyzed.",
            "ingested_id": str(res.inserted_id),
            "customer_id": processed["customer_id"],
            "sentiment": sentiment
        }
    except Exception as e:
        logger.error(f"Email ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio")
async def ingest_audio(
    file: UploadFile = File(...),
    customer_id: str = Form(...),
    agent_id: str = Form("AGT-101"),
    call_duration: int = Form(120)
):
    """
    Ingest customer service phone call audio.
    CRITICAL FLOW: Audio -> Whisper -> Transcript -> Text Preprocessing -> NLP (FinBERT)
    """
    try:
        suffix = os.path.splitext(file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            # 1. Audio -> Whisper -> Transcript
            transcription = whisper_service.transcribe(tmp_path)
            transcript_text = transcription["transcript"]

            # 2. Transcript -> Text Preprocessing
            feedback_payload = {
                "customer_id": customer_id,
                "feedback_text": transcript_text,
                "channel": "PHONE_CALL"
            }
            preprocessed = pipeline.process_feedback(feedback_payload)

            # 3. Preprocessed Text -> FinBERT Sentiment
            sentiment = finbert_service.analyze_sentiment(preprocessed["feedback_text"])

            # 4. Save voice record
            voice_doc = {
                "customer_id": customer_id.upper(),
                "agent_id": agent_id,
                "filename": file.filename,
                "call_duration_seconds": call_duration,
                "transcript": transcript_text,
                "language": transcription["language"],
                "confidence": transcription["confidence"],
                "sentiment": sentiment["sentiment"],
                "sentiment_confidence": sentiment["confidence"],
                "timestamp": preprocessed["timestamp"]
            }
            res = get_collection("voice_records").insert_one(voice_doc)
            voice_doc["_id"] = str(res.inserted_id)

            # If sentiment is negative, also log in complaints
            if sentiment["sentiment"] == "negative":
                get_collection("complaints").insert_one({
                    "customer_id": customer_id.upper(),
                    "type": "VOICE_CALL_ESCALATION",
                    "description": transcript_text,
                    "sentiment": "negative",
                    "channel": "PHONE_CALL",
                    "timestamp": preprocessed["timestamp"]
                })

            # Update common risk profile
            risk_profile_service.build_common_risk_profile(customer_id.upper())

            return {
                "status": "SUCCESS",
                "message": "Audio processed via Whisper and FinBERT.",
                "voice_record_id": str(res.inserted_id),
                "customer_id": customer_id.upper(),
                "transcript": transcript_text,
                "sentiment": sentiment,
                "language": transcription["language"]
            }
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    except Exception as e:
        logger.error(f"Audio ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def ingest_feedback(payload: FeedbackIngestModel):
    """
    Ingest customer feedback or complaint.
    Flow: Feedback -> Preprocessing -> FinBERT + SBERT -> MongoDB
    """
    try:
        processed = pipeline.process_feedback(payload.model_dump())
        text = processed["feedback_text"]

        # NLP Analysis
        sentiment = finbert_service.analyze_sentiment(text)
        
        # Check against previous complaints
        prev_comps = [c.get("description", "") for c in get_collection("complaints").find({"customer_id": processed["customer_id"]})]
        recurring = sbert_service.detect_recurring_issue(text, prev_comps)

        doc = {
            "customer_id": processed["customer_id"],
            "type": "COMPLAINT" if sentiment["sentiment"] == "negative" else "FEEDBACK",
            "description": text,
            "channel": processed["channel"],
            "rating": processed["rating"],
            "sentiment": sentiment["sentiment"],
            "sentiment_score": sentiment["confidence"],
            "recurring_issue_detected": recurring["detected"],
            "similarity_score": recurring["similarity_score"],
            "timestamp": processed["timestamp"],
            "features": processed["features"]
        }
        res = get_collection("complaints").insert_one(doc)
        doc["_id"] = str(res.inserted_id)

        risk_profile_service.build_common_risk_profile(processed["customer_id"])

        return {
            "status": "SUCCESS",
            "complaint_id": str(res.inserted_id),
            "customer_id": processed["customer_id"],
            "sentiment": sentiment,
            "recurring_issue": recurring
        }
    except Exception as e:
        logger.error(f"Feedback ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transaction")
async def ingest_transaction(payload: TransactionIngestModel):
    """
    Ingest structured transaction.
    Flow: Transaction -> Preprocessing -> Isolation Forest Anomaly -> MongoDB
    """
    try:
        processed = pipeline.process_transaction(payload.model_dump())
        
        # Save to database
        res = get_collection("transactions").insert_one(processed)
        processed["_id"] = str(res.inserted_id)

        # Update profile
        risk_profile_service.build_common_risk_profile(processed["customer_id"])

        return {
            "status": "SUCCESS",
            "transaction_id": str(res.inserted_id),
            "customer_id": processed["customer_id"],
            "amount": processed["amount"],
            "is_large_amount": processed["derived_flags"]["is_large_amount"]
        }
    except Exception as e:
        logger.error(f"Transaction ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/loan")
async def ingest_loan(payload: LoanProcessIngestModel):
    """
    Ingest loan process / repayment update.
    Flow: Loan Data -> Preprocessing -> Financial Feature Extraction -> MongoDB
    """
    try:
        cust = get_collection("customers").find_one({"customer_id": payload.customer_id.upper()}) or {}
        income = float(cust.get("monthly_income", 50000.0))

        processed = pipeline.process_loan(payload.model_dump(), monthly_income=income)
        
        # Upsert loan record
        res = get_collection("loan_records").update_one(
            {"customer_id": processed["customer_id"], "loan_id": processed["loan_id"]},
            {"$set": processed},
            upsert=True
        )

        risk_profile_service.build_common_risk_profile(processed["customer_id"])

        return {
            "status": "SUCCESS",
            "customer_id": processed["customer_id"],
            "loan_id": processed["loan_id"],
            "financial_ratios": processed["financial_ratios"]
        }
    except Exception as e:
        logger.error(f"Loan ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/system-log")
async def ingest_system_log(payload: SystemLogIngestModel):
    """
    Ingest bank system operational event.
    Flow: System Log -> Preprocessing -> Failure Pattern Detection -> MongoDB
    """
    try:
        processed = pipeline.process_system_log(payload.model_dump())
        res = get_collection("system_events").insert_one(processed)
        processed["_id"] = str(res.inserted_id)

        return {
            "status": "SUCCESS",
            "event_id": str(res.inserted_id),
            "service_name": processed["service_name"],
            "severity": processed["severity"]
        }
    except Exception as e:
        logger.error(f"System log ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
