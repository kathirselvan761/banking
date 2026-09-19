from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class EmailIngestModel(BaseModel):
    model_config = ConfigDict(extra="allow")
    customer_id: str = Field(..., description="Unique customer identifier e.g. C101")
    sender: str = Field(..., description="Sender email address")
    subject: str = Field(default="", description="Email subject line")
    body: str = Field(..., description="Email body message content")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp")

class FeedbackIngestModel(BaseModel):
    model_config = ConfigDict(extra="allow")
    customer_id: str = Field(..., description="Customer identifier")
    feedback_text: str = Field(..., description="Customer feedback or grievance description")
    channel: Optional[str] = Field(default="portal", description="Channel: mobile_app, portal, branch, email")
    rating: Optional[int] = Field(default=None, description="Optional satisfaction rating (1-5)")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp")

class TransactionIngestModel(BaseModel):
    model_config = ConfigDict(extra="allow")
    customer_id: str = Field(..., description="Customer ID")
    amount: float = Field(..., description="Transaction monetary value")
    type: Optional[str] = Field(default="DEBIT", description="DEBIT, CREDIT, TRANSFER, WITHDRAWAL")
    merchant: Optional[str] = Field(default="Unknown", description="Merchant / Counterparty")
    category: Optional[str] = Field(default="General", description="Category of expense")
    channel: Optional[str] = Field(default="UPI", description="Payment channel: UPI, NEFT, ATM, CARD")
    location: Optional[str] = Field(default="Domestic", description="Transaction geographical location")
    device_id: Optional[str] = Field(default="DEV-DEFAULT", description="Device identifier")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp")

class LoanProcessIngestModel(BaseModel):
    model_config = ConfigDict(extra="allow")
    customer_id: str = Field(..., description="Customer ID")
    loan_id: Optional[str] = Field(default=None, description="Loan identifier")
    loan_type: Optional[str] = Field(default="PERSONAL", description="HOME, PERSONAL, AUTO, SME")
    principal_amount: float = Field(..., description="Total loan amount")
    monthly_emi: float = Field(..., description="Monthly EMI repayment amount")
    tenure_months: Optional[int] = Field(default=36, description="Loan duration in months")
    outstanding_amount: Optional[float] = Field(default=0.0, description="Outstanding balance")
    overdue_amount: Optional[float] = Field(default=0.0, description="Past due overdue amount")
    emi_delay_count: Optional[int] = Field(default=0, description="Consecutive or historical EMI delay count")
    interest_rate: Optional[float] = Field(default=10.5, description="Annual percentage rate")
    status: Optional[str] = Field(default="ACTIVE", description="ACTIVE, DELINQUENT, CLOSED")
    timestamp: Optional[str] = Field(default=None, description="Update timestamp")

class SystemLogIngestModel(BaseModel):
    model_config = ConfigDict(extra="allow")
    service_name: str = Field(..., description="Subsystem or service name e.g. PAYMENT_GATEWAY, CBS")
    event_type: str = Field(..., description="Event classification e.g. FAILURE, TIMEOUT, DISPUTE")
    severity: str = Field(default="WARN", description="INFO, WARN, ERROR, CRITICAL")
    message: str = Field(..., description="Operational log trace message")
    customer_id: Optional[str] = Field(default=None, description="Associated customer if applicable")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp")

class AudioMetadataModel(BaseModel):
    model_config = ConfigDict(extra="allow")
    customer_id: str = Field(..., description="Customer identifier")
    agent_id: Optional[str] = Field(default="AGT-101", description="Support agent identifier")
    call_duration_seconds: Optional[int] = Field(default=0, description="Call duration in seconds")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp")
