"""
Train ML Models: XGBoost Default Risk & Isolation Forest Anomaly Detection
Run: python train_models.py
"""

import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.prediction_model import prediction_model
from models.anomaly_model import anomaly_model

def main():
    print("==================================================")
    print("STEP 3: Training ML Models for Banking AI")
    print("==================================================")

    # 1. Train XGBoost model
    print("\n--- 1. Training XGBoost Default Prediction Model ---")
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "training_data.csv")
    metrics = prediction_model.train(data_path)

    # 2. Train Isolation Forest model
    print("\n--- 2. Training Isolation Forest Anomaly Detection Model ---")
    anomaly_model.train(num_samples=2500)

    # 3. Test Predictions
    print("\n--- 3. Testing Test Sample Inferences ---")
    sample_risk = prediction_model.predict_default_risk({
        "credit_score": 680,
        "monthly_income": 50000,
        "loan_amount": 400000,
        "monthly_emi": 12000,
        "outstanding_amount": 320000,
        "overdue_amount": 18000,
        "emi_delay_count": 2,
        "previous_payment_delays": 2,
        "complaint_count": 3,
        "negative_sentiment_count": 1,
        "transaction_count": 50,
        "transaction_anomaly_count": 1
    })
    print(f"Sample Risk Prediction: {sample_risk}")

    sample_anomaly = anomaly_model.detect_anomaly({
        "amount": 95000,
        "transaction_count": 10,
        "hour_of_day": 3,
        "location_frequency": 1,
        "device_frequency": 1
    })
    print(f"Sample Transaction Anomaly (Spike): {sample_anomaly}")

    sample_normal_tx = anomaly_model.detect_anomaly({
        "amount": 250,
        "transaction_count": 5,
        "hour_of_day": 14,
        "location_frequency": 12,
        "device_frequency": 20
    })
    print(f"Sample Transaction Anomaly (Normal): {sample_normal_tx}")

    print("\nAll models trained and verified successfully!")

if __name__ == '__main__':
    main()
