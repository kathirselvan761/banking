"""
Feature Engineering Service for Banking AI Early Warning
Converts raw customer, loan, transaction, and complaint data into validated ML feature vectors.
"""

from typing import Dict, Any, List, Union
import pandas as pd
import numpy as np

# Ordered canonical features for the XGBoost model
FEATURE_COLUMNS: List[str] = [
    "credit_score",
    "monthly_income",
    "loan_amount",
    "monthly_emi",
    "outstanding_amount",
    "overdue_amount",
    "emi_delay_count",
    "previous_payment_delays",
    "complaint_count",
    "negative_sentiment_count",
    "transaction_count",
    "transaction_anomaly_count"
]

# Reasonable default fallback values for missing features
FEATURE_DEFAULTS: Dict[str, float] = {
    "credit_score": 650.0,
    "monthly_income": 50000.0,
    "loan_amount": 300000.0,
    "monthly_emi": 10000.0,
    "outstanding_amount": 250000.0,
    "overdue_amount": 0.0,
    "emi_delay_count": 0.0,
    "previous_payment_delays": 0.0,
    "complaint_count": 0.0,
    "negative_sentiment_count": 0.0,
    "transaction_count": 30.0,
    "transaction_anomaly_count": 0.0
}

def extract_features(raw_data: Union[Dict[str, Any], pd.DataFrame]) -> pd.DataFrame:
    """
    Extracts, cleans, and validates features for XGBoost prediction.
    Accepts a dictionary (single record) or a pandas DataFrame.
    Returns a validated pandas DataFrame with exactly FEATURE_COLUMNS in order.
    """
    if isinstance(raw_data, dict):
        df = pd.DataFrame([raw_data])
    elif isinstance(raw_data, pd.DataFrame):
        df = raw_data.copy()
    else:
        raise ValueError(f"Unsupported data type: {type(raw_data)}. Expected dict or DataFrame.")

    # Ensure all required columns exist with defaults if missing
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = FEATURE_DEFAULTS[col]
        else:
            # Numeric conversion with coercion for bad strings/types
            df[col] = pd.to_numeric(df[col], errors='coerce')
            # Fill NaN / Null values with standard defaults
            df[col] = df[col].fillna(FEATURE_DEFAULTS[col])

    # Basic business validation & bounding
    df['credit_score'] = df['credit_score'].clip(300, 850)
    df['monthly_income'] = df['monthly_income'].clip(lower=0)
    df['loan_amount'] = df['loan_amount'].clip(lower=0)
    df['monthly_emi'] = df['monthly_emi'].clip(lower=0)
    df['outstanding_amount'] = df['outstanding_amount'].clip(lower=0)
    df['overdue_amount'] = df['overdue_amount'].clip(lower=0)
    df['emi_delay_count'] = df['emi_delay_count'].clip(lower=0)
    df['previous_payment_delays'] = df['previous_payment_delays'].clip(lower=0)
    df['complaint_count'] = df['complaint_count'].clip(lower=0)
    df['negative_sentiment_count'] = df['negative_sentiment_count'].clip(lower=0)
    df['transaction_count'] = df['transaction_count'].clip(lower=0)
    df['transaction_anomaly_count'] = df['transaction_anomaly_count'].clip(lower=0)

    # Return ordered DataFrame strictly with the specified features
    return df[FEATURE_COLUMNS]

class FeatureService:
    def __init__(self):
        self.feature_columns = FEATURE_COLUMNS

    def process(self, data: Union[Dict[str, Any], pd.DataFrame]) -> pd.DataFrame:
        return extract_features(data)

# Singleton instance
feature_service = FeatureService()
