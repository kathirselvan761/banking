"""
Synthetic Banking Dataset Generator for Loan Default Early Warning
Generates at least 1000 realistic records with non-linear correlations and noise.
"""

import numpy as np
import pandas as pd
import random
import os

def generate_synthetic_data(num_records=1500, random_seed=42):
    np.random.seed(random_seed)
    random.seed(random_seed)

    employment_types = ['Salaried', 'Self-Employed', 'Business Owner', 'Freelance']

    records = []

    for i in range(1, num_records + 1):
        customer_id = f"C{i:04d}"
        employment_type = random.choice(employment_types)

        # Baseline credit score (300 to 850)
        # Bimodal or normal centered around 680
        credit_score = int(np.clip(np.random.normal(680, 80), 350, 850))

        # Monthly income in INR/USD equivalent (e.g. 20,000 to 250,000)
        monthly_income = int(np.clip(np.random.lognormal(mean=10.8, sigma=0.5), 20000, 300000))

        # Loan amount (typically 3x to 25x monthly income)
        loan_multiplier = np.random.uniform(3.0, 15.0)
        loan_amount = int(round(monthly_income * loan_multiplier, -3))

        # Monthly EMI (~ 2% to 4% of loan amount, usually 15% to 60% of monthly income)
        monthly_emi = int(round(np.random.uniform(0.02, 0.035) * loan_amount, -2))

        # Outstanding amount (between 10% and 95% of loan amount)
        outstanding_pct = np.random.uniform(0.15, 0.95)
        outstanding_amount = int(round(loan_amount * outstanding_pct, -2))

        # EMI delay count (0 to 6)
        # Latent financial distress factor
        income_emi_ratio = monthly_emi / max(monthly_income, 1)
        credit_risk_factor = (850 - credit_score) / 500.0  # 0 (best) to 1 (worst)

        # Probability of experiencing delays increases with credit risk and EMI burden
        delay_prob = 0.15 + (0.5 * credit_risk_factor) + (0.25 * min(income_emi_ratio, 1.0))
        delay_prob = np.clip(delay_prob, 0.05, 0.85)

        if np.random.rand() < delay_prob:
            emi_delay_count = int(np.random.choice([1, 2, 3, 4, 5], p=[0.45, 0.25, 0.15, 0.10, 0.05]))
            previous_payment_delays = int(emi_delay_count + np.random.poisson(lam=1.5))
            # Overdue amount is roughly monthly_emi * delays + penalty
            overdue_amount = int(round(monthly_emi * emi_delay_count * np.random.uniform(0.9, 1.2), -2))
        else:
            emi_delay_count = 0
            previous_payment_delays = int(np.random.choice([0, 1], p=[0.85, 0.15]))
            overdue_amount = 0

        # Complaint count & negative sentiment
        if emi_delay_count > 0:
            complaint_count = int(np.random.poisson(lam=1.8))
            negative_sentiment_count = int(min(complaint_count, np.random.poisson(lam=1.2)))
        else:
            complaint_count = int(np.random.poisson(lam=0.4))
            negative_sentiment_count = int(min(complaint_count, np.random.poisson(lam=0.2)))

        # Transaction count & anomalies
        transaction_count = int(np.clip(np.random.normal(45, 18), 5, 150))
        if emi_delay_count >= 2:
            transaction_anomaly_count = int(np.random.choice([0, 1, 2, 3], p=[0.4, 0.35, 0.15, 0.10]))
        else:
            transaction_anomaly_count = int(np.random.choice([0, 1, 2], p=[0.85, 0.12, 0.03]))

        # Calculate target: default_next_90_days
        # Logistic latent score with realistic weights
        # Base log-odds
        z = -2.8
        z += 0.85 * (overdue_amount / max(monthly_emi, 1))
        z += 0.65 * emi_delay_count
        z += 0.25 * previous_payment_delays
        z += 0.40 * (income_emi_ratio - 0.35) * 5.0
        z -= 0.007 * (credit_score - 650)
        z += 0.30 * complaint_count
        z += 0.45 * negative_sentiment_count
        z += 0.50 * transaction_anomaly_count

        # Add Gaussian noise so it's not perfectly separable
        z += np.random.normal(0, 0.75)

        default_prob = 1.0 / (1.0 + np.exp(-z))
        default_next_90_days = 1 if np.random.rand() < default_prob else 0

        records.append({
            'customer_id': customer_id,
            'credit_score': credit_score,
            'monthly_income': monthly_income,
            'loan_amount': loan_amount,
            'monthly_emi': monthly_emi,
            'outstanding_amount': outstanding_amount,
            'overdue_amount': overdue_amount,
            'emi_delay_count': emi_delay_count,
            'previous_payment_delays': previous_payment_delays,
            'complaint_count': complaint_count,
            'negative_sentiment_count': negative_sentiment_count,
            'transaction_count': transaction_count,
            'transaction_anomaly_count': transaction_anomaly_count,
            'employment_type': employment_type,
            'default_next_90_days': default_next_90_days
        })

    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    df = generate_synthetic_data(num_records=1500)
    output_path = os.path.join(os.path.dirname(__file__), 'training_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records to {output_path}")
    print(f"Default rate: {df['default_next_90_days'].mean():.2%}")
    print("Correlations with default_next_90_days:")
    numeric_df = df.select_dtypes(include=[np.number])
    print(numeric_df.corr()['default_next_90_days'].sort_values(ascending=False))
