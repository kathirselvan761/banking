"""
Financial & Customer Support Sentiment Analysis Service
Blends FinBERT with domain-specific customer service sentiment engine.
"""

import re
import math
from typing import Dict, Any

# FinBERT pipeline cache
finbert_pipeline = None

def init_finbert():
    global finbert_pipeline
    if finbert_pipeline is not None:
        return finbert_pipeline
    try:
        from transformers import pipeline
        # Try loading ProsusAI/finbert
        finbert_pipeline = pipeline(
            "text-classification",
            model="ProsusAI/finbert",
            top_k=None
        )
        print("[INFO] FinBERT model loaded successfully.")
    except Exception as e:
        print(f"[WARN] FinBERT model load failed ({e}), using calibrated fallback.")
        finbert_pipeline = False
    return finbert_pipeline

# Domain-specific financial distress and sentiment lexicon for banking customer support
FINANCIAL_NEGATIVE_WORDS = {
    "failed": 2.5, "failure": 2.5, "frustrated": 2.8, "angry": 2.5, "terrible": 2.5,
    "overdue": 2.0, "penalty": 2.2, "freeze": 2.2, "frozen": 2.4, "blocked": 2.2,
    "dispute": 1.8, "unauthorized": 2.8, "fraud": 3.0, "scam": 3.0, "cannot": 1.5,
    "unable": 1.5, "delay": 1.8, "delayed": 1.8, "stolen": 2.8, "loss": 2.0,
    "horrible": 2.8, "unresolved": 2.2, "worst": 2.8, "harassment": 3.0, "legal": 2.0,
    "default": 2.5, "struggling": 2.2, "debt": 1.8, "worried": 2.0, "distress": 2.5,
    "nobody": 1.5, "problem": 1.8, "issue": 1.0, "not": 1.2
}

FINANCIAL_POSITIVE_WORDS = {
    "resolved": 2.2, "thank": 2.0, "thanks": 2.0, "helpful": 2.0, "great": 2.2,
    "excellent": 2.5, "smooth": 1.8, "appreciated": 2.0, "cleared": 2.0, "paid": 1.5,
    "success": 2.2, "successful": 2.2, "satisfied": 2.2, "good": 1.5, "prompt": 1.8
}

def analyze_sentiment_banking(text: str) -> Dict[str, Any]:
    """
    Computes calibrated financial customer support sentiment scores.
    """
    cleaned = text.lower()
    words = re.findall(r'\b[a-z]+\b', cleaned)

    neg_weight = 0.0
    pos_weight = 0.0

    for w in words:
        if w in FINANCIAL_NEGATIVE_WORDS:
            neg_weight += FINANCIAL_NEGATIVE_WORDS[w]
        if w in FINANCIAL_POSITIVE_WORDS:
            pos_weight += FINANCIAL_POSITIVE_WORDS[w]

    # Intensifiers
    if "again" in words or "twice" in words or "never" in words:
        if neg_weight > 0:
            neg_weight *= 1.35

    intensity = pos_weight + neg_weight

    if intensity == 0:
        return {
            "sentiment": "neutral",
            "positive_score": 0.15,
            "negative_score": 0.15,
            "neutral_score": 0.70
        }

    # Softmax scaling with calibrated exponents
    exp_pos = math.exp(pos_weight * 0.75)
    exp_neg = math.exp(neg_weight * 0.75)
    exp_neu = math.exp(max(0.5, 2.5 - (intensity * 0.5)))

    total = exp_pos + exp_neg + exp_neu
    p_pos = round(exp_pos / total, 2)
    p_neg = round(exp_neg / total, 2)
    p_neu = round(max(0.01, 1.0 - (p_pos + p_neg)), 2)

    # Normalize sum to 1.00
    norm_sum = p_pos + p_neg + p_neu
    p_pos = round(p_pos / norm_sum, 2)
    p_neg = round(p_neg / norm_sum, 2)
    p_neu = round(1.0 - p_pos - p_neg, 2)

    if p_neg > p_pos and p_neg > p_neu:
        label = "negative"
    elif p_pos > p_neg and p_pos > p_neu:
        label = "positive"
    else:
        label = "neutral"

    return {
        "sentiment": label,
        "positive_score": p_pos,
        "negative_score": p_neg,
        "neutral_score": p_neu
    }

class SentimentService:
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyzes customer text sentiment.
        """
        if not text or not text.strip():
            return {
                "sentiment": "neutral",
                "positive_score": 0.0,
                "negative_score": 0.0,
                "neutral_score": 1.0
            }

        # Use banking customer support sentiment engine
        banking_res = analyze_sentiment_banking(text)

        # Check FinBERT if available
        pipe = init_finbert()
        if pipe:
            try:
                scores = pipe(text)[0]
                fb_dict = {item['label'].lower(): round(float(item['score']), 2) for item in scores}
                best_label = max(fb_dict, key=fb_dict.get)
                return {
                    "sentiment": best_label,
                    "positive_score": fb_dict.get("positive", 0.0),
                    "negative_score": fb_dict.get("negative", 0.0),
                    "neutral_score": fb_dict.get("neutral", 0.0)
                }
            except Exception as e:
                print(f"[WARN] FinBERT inference failed ({e}), using fallback.")

        return banking_res

sentiment_service = SentimentService()
