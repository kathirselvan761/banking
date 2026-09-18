"""
Isolation Forest Transaction Anomaly Detection Model
Trains and infers behavioral anomalies across transaction streams without labeling as confirmed fraud.
"""

import os
import joblib
from typing import Dict, Any, Union
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
ANOMALY_MODEL_FILE = os.path.join(SAVED_MODELS_DIR, "isolation_forest.pkl")

ANOMALY_FEATURE_COLUMNS = [
    "amount",
    "transaction_count",
    "hour_of_day",
    "location_frequency",
    "device_frequency"
]

ANOMALY_FEATURE_DEFAULTS = {
    "amount": 1500.0,
    "transaction_count": 5.0,
    "hour_of_day": 14.0,
    "location_frequency": 5.0,
    "device_frequency": 8.0
}

def extract_transaction_features(raw_tx: Union[Dict[str, Any], pd.DataFrame]) -> pd.DataFrame:
    """Extracts and validates features for transaction anomaly inference."""
    if isinstance(raw_tx, dict):
        df = pd.DataFrame([raw_tx])
    elif isinstance(raw_tx, pd.DataFrame):
        df = raw_tx.copy()
    else:
        raise ValueError("Input must be a dict or DataFrame")

    for col in ANOMALY_FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = ANOMALY_FEATURE_DEFAULTS[col]
        else:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(ANOMALY_FEATURE_DEFAULTS[col])

    return df[ANOMALY_FEATURE_COLUMNS]

class AnomalyModel:
    def __init__(self):
        self.model = None
        self.is_loaded = False
        self._load_if_exists()

    def _load_if_exists(self):
        if os.path.exists(ANOMALY_MODEL_FILE):
            try:
                self.model = joblib.load(ANOMALY_MODEL_FILE)
                self.is_loaded = True
                print(f"[INFO] Loaded Isolation Forest model from {ANOMALY_MODEL_FILE}")
            except Exception as e:
                print(f"[WARN] Could not load Isolation Forest model: {e}")
                self.model = None
                self.is_loaded = False

    def train(self, num_samples: int = 2500) -> None:
        """
        Generates synthetic transaction baseline behavior and fits IsolationForest.
        Contamination set around 0.05 (5% anomalies).
        """
        np.random.seed(42)

        # 95% regular customer transaction patterns
        n_normal = int(num_samples * 0.95)
        normal_amounts = np.random.exponential(scale=2000, size=n_normal) + 50
        normal_counts = np.random.poisson(lam=6, size=n_normal) + 1
        normal_hours = np.random.normal(loc=14, scale=3.5, size=n_normal) % 24
        normal_loc_freq = np.random.poisson(lam=12, size=n_normal) + 1
        normal_dev_freq = np.random.poisson(lam=20, size=n_normal) + 1

        # 5% anomalous patterns: high amounts, unusual hours (e.g. 3 AM), new location/device
        n_anom = num_samples - n_normal
        anom_amounts = np.random.uniform(50000, 200000, size=n_anom)
        anom_counts = np.random.choice([1, 25, 40], size=n_anom)
        anom_hours = np.random.choice([1, 2, 3, 4], size=n_anom)
        anom_loc_freq = np.ones(n_anom)
        anom_dev_freq = np.ones(n_anom)

        amounts = np.concatenate([normal_amounts, anom_amounts])
        counts = np.concatenate([normal_counts, anom_counts])
        hours = np.concatenate([normal_hours, anom_hours])
        loc_freqs = np.concatenate([normal_loc_freq, anom_loc_freq])
        dev_freqs = np.concatenate([normal_dev_freq, anom_dev_freq])

        X = pd.DataFrame({
            "amount": amounts,
            "transaction_count": counts,
            "hour_of_day": hours,
            "location_frequency": loc_freqs,
            "device_frequency": dev_freqs
        })

        print(f"[TRAINING] Fitting Isolation Forest on {len(X)} synthetic transactions (contamination=0.05)...")
        iso = IsolationForest(
            n_estimators=120,
            contamination=0.05,
            random_state=42,
            n_jobs=-1
        )
        iso.fit(X)

        os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
        joblib.dump(iso, ANOMALY_MODEL_FILE)
        self.model = iso
        self.is_loaded = True
        print(f"[TRAINING] Saved Isolation Forest model to {ANOMALY_MODEL_FILE}")

    def detect_anomaly(self, transaction_data: Union[Dict[str, Any], pd.DataFrame]) -> Dict[str, Any]:
        """
        Infers transaction anomaly status and anomaly decision score.
        Returns:
            is_anomaly: bool
            anomaly_score: float (negative indicates anomaly)
        """
        if not self.is_loaded or self.model is None:
            self._load_if_exists()
            if not self.is_loaded or self.model is None:
                print("[WARN] Isolation Forest model not loaded. Training now...")
                self.train()

        X = extract_transaction_features(transaction_data)

        # In scikit-learn IsolationForest:
        # predict returns -1 for anomaly, 1 for inlier
        prediction = self.model.predict(X)[0]
        # decision_function: negative scores represent abnormal/outlier instances
        score = float(self.model.decision_function(X)[0])

        is_anomaly = bool(prediction == -1)

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(score, 2)
        }

# Global singleton
anomaly_model = AnomalyModel()

def detect_anomaly(transaction: Dict[str, Any]) -> Dict[str, Any]:
    return anomaly_model.detect_anomaly(transaction)
