import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List
import logging

logger = logging.getLogger("banking_ai.segmentation")

class SegmentationService:
    def __init__(self, n_clusters: int = 5):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
        self.fitted = False
        self.cluster_names = {}
        self._init_benchmark_clusters()

    def _init_benchmark_clusters(self):
        """Fit K-Means on representative banking customer archetypes to derive cluster semantics."""
        # Features: [income, credit_score, loan_amount, monthly_emi, tx_freq, credit_util, emi_delays, complaint_count]
        archetypes = np.array([
            # 1. Stable Active: Good income, high credit, low delays, low complaints, high activity
            [75000, 780, 300000, 10000, 45, 0.25, 0, 0],
            [85000, 800, 400000, 12000, 55, 0.20, 0, 0],
            [90000, 750, 250000, 8000, 50, 0.30, 0, 1],

            # 2. High Value Customer: Very high income, large loans, high transactions, clean repayment
            [250000, 820, 2000000, 45000, 80, 0.15, 0, 0],
            [300000, 840, 2500000, 55000, 95, 0.18, 0, 0],
            [220000, 810, 1800000, 40000, 70, 0.22, 0, 1],

            # 3. Credit Risk Pattern: Stressed credit score, high delays, high utilization
            [35000, 580, 400000, 14000, 20, 0.85, 3, 1],
            [40000, 540, 500000, 16000, 18, 0.90, 4, 2],
            [45000, 610, 350000, 12000, 22, 0.78, 2, 1],

            # 4. Dissatisfied Customer: High complaints, frequent support grievances, moderate finance
            [60000, 700, 300000, 9500, 35, 0.40, 0, 5],
            [65000, 710, 350000, 11000, 40, 0.45, 1, 4],
            [55000, 680, 280000, 9000, 30, 0.50, 0, 6],

            # 5. Low Engagement Customer: Very low tx_freq, dormant account, small loan
            [30000, 690, 80000, 2500, 4, 0.20, 0, 0],
            [28000, 710, 60000, 2000, 3, 0.15, 0, 0],
            [35000, 670, 100000, 3000, 6, 0.25, 0, 0],
        ])

        scaled = self.scaler.fit_transform(archetypes)
        self.kmeans.fit(scaled)
        self.fitted = True

        # Derive human-readable names dynamically from cluster centroids
        centroids = self.scaler.inverse_transform(self.kmeans.cluster_centers_)
        for cid, center in enumerate(centroids):
            inc, cred, loan, emi, tx, util, delays, complaints = center
            if inc > 180000:
                self.cluster_names[cid] = "High Value Customer"
            elif delays >= 1.5 or util >= 0.70 or cred < 630:
                self.cluster_names[cid] = "Credit Risk Pattern"
            elif complaints >= 3.0:
                self.cluster_names[cid] = "Dissatisfied Customer"
            elif tx < 10:
                self.cluster_names[cid] = "Low Engagement Customer"
            else:
                self.cluster_names[cid] = "Stable Active Customer"

        logger.info(f"K-Means segmentation initialized. Clusters: {self.cluster_names}")

    def segment_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Segments a customer using K-Means and returns cluster ID and derived semantic segment name.
        """
        inc = float(customer_data.get("monthly_income", customer_data.get("income", 50000.0)))
        cred = float(customer_data.get("credit_score", 650.0))
        loan = float(customer_data.get("loan_amount", 200000.0))
        emi = float(customer_data.get("monthly_emi", 7000.0))
        tx = float(customer_data.get("transaction_count", 25.0))
        util = float(customer_data.get("credit_utilization", 0.40))
        delays = float(customer_data.get("emi_delay_count", 0.0))
        complaints = float(customer_data.get("complaint_count", 0.0))

        feat_vector = np.array([[inc, cred, loan, emi, tx, util, delays, complaints]])
        scaled_vec = self.scaler.transform(feat_vector)
        cluster_id = int(self.kmeans.predict(scaled_vec)[0])
        segment_name = self.cluster_names.get(cluster_id, "Standard Banking Customer")

        return {
            "cluster_id": cluster_id,
            "segment_name": segment_name,
            "characteristics": {
                "income_tier": "High" if inc > 120000 else ("Moderate" if inc > 45000 else "Low"),
                "credit_profile": "Prime" if cred >= 750 else ("Near Prime" if cred >= 650 else "Subprime"),
                "activity_level": "High" if tx > 40 else ("Moderate" if tx > 15 else "Low"),
                "delinquency_risk": "Elevated" if delays > 1 or util > 0.7 else "Normal"
            }
        }

segmentation_service = SegmentationService()
