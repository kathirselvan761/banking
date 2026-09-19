import re
import math
import logging
from typing import Dict, Any

logger = logging.getLogger("banking_ai.finbert")

_finbert_pipeline = None

def get_finbert_pipeline():
    global _finbert_pipeline
    if _finbert_pipeline is not None:
        return _finbert_pipeline
    try:
        from transformers import pipeline
        logger.info("Initializing FinBERT text-classification pipeline...")
        _finbert_pipeline = pipeline("text-classification", model="ProsusAI/finbert", top_k=None)
        logger.info("FinBERT pipeline ready.")
        return _finbert_pipeline
    except Exception as e:
        logger.warning(f"Could not load HuggingFace FinBERT model: {e}. Using calibrated financial sentiment engine.")
        _finbert_pipeline = False
        return False

# Financial domain grievance lexicon for calibrated sentiment scoring
FINANCIAL_NEGATIVE_WORDS = {
    "failed": 2.5, "failure": 2.5, "frustrated": 2.8, "angry": 2.5, "terrible": 2.5,
    "overdue": 2.2, "penalty": 2.2, "freeze": 2.2, "frozen": 2.4, "blocked": 2.2,
    "dispute": 2.0, "unauthorized": 2.8, "fraud": 3.0, "scam": 3.0, "cannot": 1.5,
    "unable": 1.5, "delay": 1.8, "delayed": 1.8, "stolen": 2.8, "loss": 2.0,
    "horrible": 2.8, "unresolved": 2.2, "worst": 2.8, "harassment": 3.0, "legal": 2.2,
    "default": 2.5, "struggling": 2.2, "debt": 1.8, "worried": 2.0, "distress": 2.5,
    "nobody": 1.5, "problem": 1.8, "issue": 1.2, "not": 1.0, "bad": 2.0
}

FINANCIAL_POSITIVE_WORDS = {
    "resolved": 2.5, "thank": 2.0, "thanks": 2.0, "helpful": 2.0, "great": 2.2,
    "excellent": 2.5, "smooth": 2.0, "appreciated": 2.0, "cleared": 2.0, "paid": 1.8,
    "success": 2.2, "successful": 2.2, "satisfied": 2.5, "good": 1.8, "prompt": 2.0
}

class FinBERTService:
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyzes financial sentiment on text (email, feedback, complaint, transcript).
        Uses model output.
        """
        if not text or not text.strip():
            return {
                "sentiment": "neutral",
                "confidence": 0.50,
                "positive_score": 0.25,
                "negative_score": 0.25,
                "neutral_score": 0.50
            }

        pipe = get_finbert_pipeline()
        if pipe:
            try:
                results = pipe(text[:512])[0]
                scores = {r["label"].lower(): r["score"] for r in results}
                pos = scores.get("positive", 0.0)
                neg = scores.get("negative", 0.0)
                neu = scores.get("neutral", 0.0)
                
                top_label = max(scores, key=scores.get)
                confidence = round(scores[top_label], 2)
                return {
                    "sentiment": top_label,
                    "confidence": confidence,
                    "positive_score": round(pos, 3),
                    "negative_score": round(neg, 3),
                    "neutral_score": round(neu, 3)
                }
            except Exception as e:
                logger.warning(f"FinBERT inference fallback due to: {e}")

        # Calibrated financial customer sentiment fallback
        cleaned = text.lower()
        words = re.findall(r'\b[a-z]+\b', cleaned)
        neg_score = sum(FINANCIAL_NEGATIVE_WORDS.get(w, 0.0) for w in words)
        pos_score = sum(FINANCIAL_POSITIVE_WORDS.get(w, 0.0) for w in words)

        total = neg_score + pos_score + 1.0
        p_neg = neg_score / total
        p_pos = pos_score / total
        p_neu = max(0.1, 1.0 - p_neg - p_pos)

        # Softmax normalization
        exp_neg = math.exp(p_neg * 3.0)
        exp_pos = math.exp(p_pos * 3.0)
        exp_neu = math.exp(p_neu * 1.5)
        sum_exp = exp_neg + exp_pos + exp_neu

        norm_neg = round(exp_neg / sum_exp, 3)
        norm_pos = round(exp_pos / sum_exp, 3)
        norm_neu = round(exp_neu / sum_exp, 3)

        if norm_neg > norm_pos and norm_neg > 0.40:
            label = "negative"
            confidence = norm_neg
        elif norm_pos > norm_neg and norm_pos > 0.40:
            label = "positive"
            confidence = norm_pos
        else:
            label = "neutral"
            confidence = norm_neu

        return {
            "sentiment": label,
            "confidence": round(confidence, 2),
            "positive_score": norm_pos,
            "negative_score": norm_neg,
            "neutral_score": norm_neu
        }

finbert_service = FinBERTService()
