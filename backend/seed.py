"""
Seed Database for Banking AI Early Warning & Decision Intelligence System
Populates MongoDB with comprehensive demo profiles including the primary crisis customer C101.
Run: python seed.py
"""

import sys
import os
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config.settings import settings
from app.services.risk_profile_service import risk_profile_service

def seed_database():
    print("==================================================")
    print("Connecting to MongoDB at:", settings.MONGO_URI)
    client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[settings.DB_NAME]
    print(f"Connected to database '{settings.DB_NAME}'.")

    # Clear old data for clean state
    collections = [
        "customers", "loan_records", "transactions", "complaints",
        "voice_records", "system_events", "risk_profiles", "alerts",
        "investigations"
    ]
    for col in collections:
        db[col].drop() # Drop entire collection to cleanly remove old index constraints
    print("Dropped and recreated collections.")

    now = datetime.now(timezone.utc)

    # --------------------------------------------------------------------------
    # 1. Customers
    # --------------------------------------------------------------------------
    customers = [
        # PRIMARY DEMO CRISIS CUSTOMER: C101
        {
            "customer_id": "C101",
            "name": "Alex Vance",
            "email": "alex.vance@demo-bank.com",
            "phone": "+91-9876543210",
            "employment_type": "Freelance Consultant",
            "monthly_income": 48000.0,
            "credit_score": 590.0, # Degraded credit score
            "credit_limit": 150000.0,
            "joined_date": "2023-01-15",
            "status": "ATTENTION_REQUIRED"
        },
        # Comparison Baseline Customers
        {
            "customer_id": "C001",
            "name": "Sarah Jenkins",
            "email": "sarah.jenkins@example.com",
            "phone": "+91-9123456780",
            "employment_type": "Salaried Tech Lead",
            "monthly_income": 125000.0,
            "credit_score": 795.0, # Prime
            "credit_limit": 500000.0,
            "joined_date": "2021-06-10",
            "status": "ACTIVE"
        },
        {
            "customer_id": "C002",
            "name": "Rajesh Sharma",
            "email": "rajesh.sharma@example.com",
            "phone": "+91-9845123456",
            "employment_type": "Business Owner",
            "monthly_income": 85000.0,
            "credit_score": 710.0,
            "credit_limit": 300000.0,
            "joined_date": "2022-03-20",
            "status": "ACTIVE"
        },
        {
            "customer_id": "C003",
            "name": "Priya Patel",
            "email": "priya.patel@example.com",
            "phone": "+91-9988776655",
            "employment_type": "Corporate Executive",
            "monthly_income": 190000.0,
            "credit_score": 820.0,
            "credit_limit": 800000.0,
            "joined_date": "2020-11-05",
            "status": "ACTIVE"
        },
        {
            "customer_id": "C004",
            "name": "David Miller",
            "email": "david.miller@example.com",
            "phone": "+91-9112233445",
            "employment_type": "Self-Employed",
            "monthly_income": 55000.0,
            "credit_score": 640.0,
            "credit_limit": 200000.0,
            "joined_date": "2022-09-12",
            "status": "MONITORED"
        }
    ]
    db["customers"].insert_many(customers)
    print(f"Inserted {len(customers)} customers (including primary crisis customer C101).")

    # --------------------------------------------------------------------------
    # 2. Loans
    # --------------------------------------------------------------------------
    loans = [
        # C101: In distress with 2 EMI delays and increasing overdue balance
        {
            "customer_id": "C101",
            "loan_id": "LN-C101-01",
            "loan_type": "PERSONAL_LOAN",
            "principal_amount": 450000.0,
            "monthly_emi": 14500.0,
            "outstanding_amount": 340000.0,
            "overdue_amount": 29000.0, # 2 unpaid installments
            "emi_delay_count": 2,
            "tenure_months": 36,
            "interest_rate": 12.5,
            "status": "DELINQUENT"
        },
        # C001: Clean mortgage
        {
            "customer_id": "C001",
            "loan_id": "LN-C001-01",
            "loan_type": "HOME_LOAN",
            "principal_amount": 4200000.0,
            "monthly_emi": 38000.0,
            "outstanding_amount": 3100000.0,
            "overdue_amount": 0.0,
            "emi_delay_count": 0,
            "tenure_months": 240,
            "interest_rate": 8.4,
            "status": "ACTIVE"
        },
        # C002: Clean auto loan
        {
            "customer_id": "C002",
            "loan_id": "LN-C002-01",
            "loan_type": "AUTO_LOAN",
            "principal_amount": 800000.0,
            "monthly_emi": 18000.0,
            "outstanding_amount": 420000.0,
            "overdue_amount": 0.0,
            "emi_delay_count": 0,
            "tenure_months": 60,
            "interest_rate": 9.2,
            "status": "ACTIVE"
        },
        # C004: Moderate loan
        {
            "customer_id": "C004",
            "loan_id": "LN-C004-01",
            "loan_type": "PERSONAL_LOAN",
            "principal_amount": 250000.0,
            "monthly_emi": 8500.0,
            "outstanding_amount": 160000.0,
            "overdue_amount": 8500.0,
            "emi_delay_count": 1,
            "tenure_months": 36,
            "interest_rate": 13.0,
            "status": "ACTIVE"
        }
    ]
    db["loan_records"].insert_many(loans)
    print(f"Inserted {len(loans)} loan records.")

    # --------------------------------------------------------------------------
    # 3. Transactions
    # --------------------------------------------------------------------------
    transactions = [
        # C101: Anomalous large withdrawal at 3:15 AM (Isolation Forest Anomaly)
        {
            "transaction_id": "TX-101-001",
            "customer_id": "C101",
            "amount": 95000.0,
            "type": "DEBIT",
            "merchant": "Crypto Exchange P2P / International Gateway",
            "category": "High Risk Transfer",
            "channel": "ONLINE",
            "hour_of_day": 3,
            "location_frequency": 1,
            "device_frequency": 1,
            "derived_flags": {"is_large_amount": True},
            "timestamp": (now - timedelta(days=1, hours=4)).isoformat()
        },
        {
            "transaction_id": "TX-101-002",
            "customer_id": "C101",
            "amount": 2400.0,
            "type": "DEBIT",
            "merchant": "Supermarket Essentials",
            "category": "Groceries",
            "channel": "UPI",
            "hour_of_day": 18,
            "location_frequency": 14,
            "device_frequency": 20,
            "derived_flags": {"is_large_amount": False},
            "timestamp": (now - timedelta(days=3)).isoformat()
        },
        {
            "transaction_id": "TX-101-003",
            "customer_id": "C101",
            "amount": 650.0,
            "type": "DEBIT",
            "merchant": "Metro Transit",
            "category": "Transport",
            "channel": "UPI",
            "hour_of_day": 9,
            "location_frequency": 22,
            "device_frequency": 25,
            "derived_flags": {"is_large_amount": False},
            "timestamp": (now - timedelta(days=4)).isoformat()
        },
        # C001: Regular payments
        {
            "transaction_id": "TX-001-001",
            "customer_id": "C001",
            "amount": 38000.0,
            "type": "DEBIT",
            "merchant": "Automated ECS EMI Debit",
            "category": "Loan Repayment",
            "channel": "ECS",
            "hour_of_day": 10,
            "location_frequency": 10,
            "device_frequency": 10,
            "derived_flags": {"is_large_amount": False},
            "timestamp": (now - timedelta(days=5)).isoformat()
        }
    ]
    db["transactions"].insert_many(transactions)
    print(f"Inserted {len(transactions)} transactions.")

    # --------------------------------------------------------------------------
    # 4. Complaints & Feedback (Repeated payment failures for SBERT detection)
    # --------------------------------------------------------------------------
    complaints = [
        # C101: Grievance 1 - UPI failed
        {
            "customer_id": "C101",
            "type": "COMPLAINT",
            "channel": "EMAIL",
            "subject": "UPI payment failed twice and money deducted",
            "description": "My UPI payment failed twice while trying to pay loan EMI and support has not refunded the money.",
            "sentiment": "negative",
            "sentiment_score": 0.94,
            "recurring_issue_detected": True,
            "similarity_score": 0.89,
            "timestamp": (now - timedelta(days=6)).isoformat()
        },
        # C101: Grievance 2 - Similar repeated failure (SBERT match!)
        {
            "customer_id": "C101",
            "type": "COMPLAINT",
            "channel": "PORTAL",
            "subject": "EMI debit transaction keeps failing on gateway",
            "description": "My EMI transaction keeps failing on the payment gateway and penalty charges were unfairly levied.",
            "sentiment": "negative",
            "sentiment_score": 0.92,
            "recurring_issue_detected": True,
            "similarity_score": 0.91,
            "timestamp": (now - timedelta(days=2)).isoformat()
        },
        # C004: Clean feedback
        {
            "customer_id": "C004",
            "type": "FEEDBACK",
            "channel": "PORTAL",
            "subject": "Mobile app login query",
            "description": "Could you please enable biometric fingerprint login on my account?",
            "sentiment": "neutral",
            "sentiment_score": 0.70,
            "recurring_issue_detected": False,
            "similarity_score": 0.15,
            "timestamp": (now - timedelta(days=10)).isoformat()
        }
    ]
    db["complaints"].insert_many(complaints)
    print(f"Inserted {len(complaints)} complaints.")

    # --------------------------------------------------------------------------
    # 5. Voice Audio Calls (Whisper STT records)
    # --------------------------------------------------------------------------
    voice_records = [
        {
            "customer_id": "C101",
            "agent_id": "AGT-204",
            "call_duration_seconds": 185,
            "filename": "call_recording_c101_delinquency.wav",
            "transcript": "Hello, I am calling again because my EMI payment failed twice this month and nobody is replying to my tickets. I am having cash flow problems and your bank slapped penalty charges on me.",
            "language": "en",
            "confidence": 0.96,
            "sentiment": "negative",
            "sentiment_confidence": 0.95,
            "timestamp": (now - timedelta(days=1)).isoformat()
        }
    ]
    db["voice_records"].insert_many(voice_records)
    print(f"Inserted {len(voice_records)} voice call transcripts.")

    # --------------------------------------------------------------------------
    # 6. Operational System Events (Gateway failures correlated with customer)
    # --------------------------------------------------------------------------
    system_events = [
        {
            "service_name": "PAYMENT_GATEWAY",
            "event_type": "PAYMENT_FAILURE",
            "severity": "CRITICAL",
            "message": "NPCI switch timeout during peak evening clearing window. 42 transactions affected.",
            "customer_id": "C101",
            "timestamp": (now - timedelta(days=6, hours=1)).isoformat()
        },
        {
            "service_name": "CBS_ACCOUNT_ENGINE",
            "event_type": "PENALTY_ACCRUAL",
            "severity": "WARN",
            "message": "Automated late fee applied on overdue account balance.",
            "customer_id": "C101",
            "timestamp": (now - timedelta(days=2)).isoformat()
        }
    ]
    db["system_events"].insert_many(system_events)
    print(f"Inserted {len(system_events)} system operational events.")

    # --------------------------------------------------------------------------
    # 7. Build Precomputed Risk Profiles for all customers
    # --------------------------------------------------------------------------
    print("\nComputing Common Risk Profiles...")
    for c in customers:
        cid = c["customer_id"]
        profile = risk_profile_service.build_common_risk_profile(cid)
        print(f"  - [{cid}] {c['name']:15} | Risk Score: {profile['risk_score']:3} ({profile['risk_level']:8}) | Future Risk: {profile['future_risk_probability']:.2f} | Segment: {profile['customer_segment']}")

    print("\n==================================================")
    print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
    print("Primary Customer C101 is primed for full end-to-end crisis demo.")
    print("==================================================")

if __name__ == "__main__":
    seed_database()
