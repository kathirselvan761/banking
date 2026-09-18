"""
XGBoost Loan Default Prediction & Risk Scoring Model
Trains and infers 90-day delinquency probability and prototype risk scores.
"""

import os
import json
from typing import Dict, Any, Union
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

from services.feature_service import extract_features, FEATURE_COLUMNS

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
MODEL_FILE = os.path.join(SAVED_MODELS_DIR, "xgboost_default_model.json")
FEATURES_METADATA_FILE = os.path.join(SAVED_MODELS_DIR, "feature_names.json")

def get_risk_level(risk_score: float) -> str:
    """
    Map risk score (0-100) to prototype risk level categories.
    0–24: LOW
    25–49: MEDIUM
    50–74: HIGH
    75–100: CRITICAL
    """
    if risk_score < 25:
        return "LOW"
    elif risk_score < 50:
        return "MEDIUM"
    elif risk_score < 75:
        return "HIGH"
    else:
        return "CRITICAL"

class PredictionModel:
    def __init__(self):
        self.model = None
        self.feature_names = FEATURE_COLUMNS
        self.is_loaded = False
        self._load_if_exists()

    def _load_if_exists(self):
        """Attempts to load saved model from disk on startup."""
        if os.path.exists(MODEL_FILE):
            try:
                self.model = XGBClassifier()
                self.model.load_model(MODEL_FILE)
                self.is_loaded = True
                if os.path.exists(FEATURES_METADATA_FILE):
                    with open(FEATURES_METADATA_FILE, 'r') as f:
                        meta = json.load(f)
                        self.feature_names = meta.get("feature_names", FEATURE_COLUMNS)
                print(f"[INFO] Loaded XGBoost model from {MODEL_FILE}")
            except Exception as e:
                print(f"[WARN] Could not load existing XGBoost model: {e}")
                self.model = None
                self.is_loaded = False

    def train(self, data_path: str = None) -> Dict[str, float]:
        """
        Trains the XGBoost classifier on training_data.csv using stratified 80/20 split.
        Saves the trained model to saved_models/xgboost_default_model.json.
        """
        if data_path is None:
            data_path = os.path.join(os.path.dirname(BASE_DIR), "data", "training_data.csv")

        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Training dataset not found at {data_path}")

        print(f"[TRAINING] Reading training data from {data_path}...")
        df = pd.read_csv(data_path)

        # Extract features and target
        X = extract_features(df)
        y = df['default_next_90_days'].astype(int)

        # 80/20 Stratified train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Initialize XGBoost with reasonable hackathon parameters
        clf = XGBClassifier(
            n_estimators=120,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=(len(y_train) - sum(y_train)) / max(sum(y_train), 1),
            random_state=42,
            eval_metric='logloss'
        )

        print("[TRAINING] Fitting XGBoost Classifier...")
        clf.fit(X_train, y_train)

        # Evaluate on test split
        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_prob))

        metrics = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "roc_auc": round(auc, 4)
        }

        print("==================================================")
        print("XGBoost Default Prediction Evaluation Metrics:")
        print(f"Accuracy:  {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall:    {metrics['recall']:.4f}")
        print(f"F1-Score:  {metrics['f1']:.4f}")
        print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
        print("==================================================")

        # Save model and feature metadata
        os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
        clf.save_model(MODEL_FILE)
        with open(FEATURES_METADATA_FILE, 'w') as f:
            json.dump({
                "feature_names": FEATURE_COLUMNS,
                "metrics": metrics
            }, f, indent=2)

        self.model = clf
        self.is_loaded = True
        self.feature_names = FEATURE_COLUMNS
        print(f"[TRAINING] Saved XGBoost model to {MODEL_FILE}")

        return metrics

    def predict_default_risk(self, raw_input: Union[Dict[str, Any], pd.DataFrame]) -> Dict[str, Any]:
        """
        Runs XGBoost inference on a customer/loan feature payload.
        Returns:
            default_probability: float (e.g. 0.78)
            risk_score: int/float (0-100)
            risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
        """
        if not self.is_loaded or self.model is None:
            self._load_if_exists()
            if not self.is_loaded or self.model is None:
                # Auto-train if saved model not found
                print("[WARN] Model not loaded. Running auto-train on available dataset...")
                self.train()

        X = extract_features(raw_input)
        # Predict probability of default (Class 1)
        prob = float(self.model.predict_proba(X)[0, 1])
        prob = round(prob, 4)

        # Convert to 0-100 risk score
        risk_score = round(prob * 100, 1)
        # If integer preferred, can round:
        risk_score_int = int(round(risk_score))
        risk_level = get_risk_level(risk_score_int)

        return {
            "default_probability": round(prob, 2),
            "risk_score": risk_score_int,
            "risk_level": risk_level
        }

# Global singleton
prediction_model = PredictionModel()
