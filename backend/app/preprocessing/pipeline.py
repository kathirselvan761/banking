import logging
from typing import Dict, Any, Tuple
from app.preprocessing.cleaner import (
    clean_email_payload,
    clean_feedback_payload,
    clean_transaction_payload,
    clean_loan_payload,
    clean_system_log_payload,
)
from app.preprocessing.feature_engineering import extract_text_features, extract_financial_features

logger = logging.getLogger("banking_ai.preprocessing_pipeline")

class PreprocessingPipeline:
    """
    Dedicated Preprocessing Pipeline implementing:
    Raw Input -> Validation -> Cleaning -> Normalization -> Feature Extraction -> Quality Logging -> Processed Output
    """

    @classmethod
    def process_email(cls, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        cleaned, quality_log = clean_email_payload(raw_data)
        features = extract_text_features(cleaned["body"])
        
        processed = {
            **cleaned,
            "features": features,
            "preprocessing_metadata": {
                "quality_log": quality_log,
                "status": "VALIDATED_AND_PREPROCESSED",
                "pipeline_version": "2.0"
            }
        }
        logger.info(f"Preprocessed EMAIL for customer {cleaned['customer_id']} with {len(features['matched_keywords'])} keywords")
        return processed

    @classmethod
    def process_feedback(cls, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        cleaned, quality_log = clean_feedback_payload(raw_data)
        features = extract_text_features(cleaned["feedback_text"])
        
        processed = {
            **cleaned,
            "features": features,
            "preprocessing_metadata": {
                "quality_log": quality_log,
                "status": "VALIDATED_AND_PREPROCESSED",
                "pipeline_version": "2.0"
            }
        }
        logger.info(f"Preprocessed FEEDBACK for customer {cleaned['customer_id']} - urgency: {features['urgency_score']}")
        return processed

    @classmethod
    def process_transaction(cls, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        cleaned, quality_log = clean_transaction_payload(raw_data)
        
        # High transaction amount heuristic check
        is_large_amount = cleaned["amount"] >= 50000.0
        
        processed = {
            **cleaned,
            "derived_flags": {
                "is_large_amount": is_large_amount,
                "unusual_hour_flag": False # Evaluated downstream in Isolation Forest
            },
            "preprocessing_metadata": {
                "quality_log": quality_log,
                "status": "VALIDATED_AND_PREPROCESSED"
            }
        }
        return processed

    @classmethod
    def process_loan(cls, raw_data: Dict[str, Any], monthly_income: float = 50000.0) -> Dict[str, Any]:
        cleaned, quality_log = clean_loan_payload(raw_data)
        fin_features = extract_financial_features(
            monthly_income=monthly_income,
            loan_amount=cleaned["principal_amount"],
            monthly_emi=cleaned["monthly_emi"],
            outstanding_amount=cleaned["outstanding_amount"],
            overdue_amount=cleaned["overdue_amount"]
        )
        
        processed = {
            **cleaned,
            "financial_ratios": fin_features,
            "preprocessing_metadata": {
                "quality_log": quality_log,
                "status": "VALIDATED_AND_PREPROCESSED"
            }
        }
        return processed

    @classmethod
    def process_system_log(cls, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        cleaned, quality_log = clean_system_log_payload(raw_data)
        text_features = extract_text_features(cleaned["message"])
        
        processed = {
            **cleaned,
            "features": text_features,
            "preprocessing_metadata": {
                "quality_log": quality_log,
                "status": "VALIDATED_AND_PREPROCESSED"
            }
        }
        return processed

pipeline = PreprocessingPipeline()
