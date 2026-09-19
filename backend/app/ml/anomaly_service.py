import os
import joblib
import numpy as np
import logging
from typing import Dict, Any
from app.config.settings import settings

logger = logging.getLogger("banking_ai.anomaly")

MODEL_PATH = os.path.join(settings.MODEL_DIR, "isolation_forest.pkl")

class AnomalyService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                logger.info(f"Loaded Isolation Forest model from {MODEL_PATH}")
            except Exception as e:
                logger.error(f"Failed to load Isolation Forest: {e}")

    def detect_anomaly(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detects unusual transaction behavior via Isolation Forest.
        Features: amount, transaction_count, hour_of_day, location_frequency, device_frequency
        Note: Anomaly does NOT mean confirmed fraud; it signifies statistical anomaly.
        """
        amount = float(tx_data.get("amount", 0.0))
        tx_count = float(tx_data.get("transaction_count", 5))
        hour = float(tx_data.get("hour_of_day", 12))
        loc_freq = float(tx_data.get("location_frequency", 1))
        dev_freq = float(tx_data.get("device_frequency", 1))

        # Check model inference
        if self.model is not None:
            try:
                X = np.array([[amount, tx_count, hour, loc_freq, dev_freq]])
                # isolation forest returns -1 for outlier, 1 for inlier
                pred = self.model.predict(X)[0]
                score = float(self.model.decision_function(X)[0])
                is_anomaly = bool(pred == -1)
                return {
                    "is_anomaly": is_anomaly,
                    "anomaly_score": round(score, 4),
                    "interpretation": "Statistical transaction anomaly detected (requires verification)" if is_anomaly else "Normal transaction behavior"
                }
            except Exception as e:
                logger.error(f"Anomaly model inference failed: {e}")

        # Heuristic fallback if model weights missing
        # Spike if amount is unusually large or transaction in dead of night (2am - 5am)
        is_spike = amount > 50000 or (amount > 10000 and (hour <= 4 or hour >= 23)) or (loc_freq <= 1 and amount > 25000)
        score = -0.15 if is_spike else 0.25
        return {
            "is_anomaly": is_spike,
            "anomaly_score": score,
            "interpretation": "Statistical transaction anomaly detected" if is_spike else "Normal transaction behavior"
        }

anomaly_service = AnomalyService()
