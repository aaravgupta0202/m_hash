from typing import Optional

from pydantic import BaseModel


class AlertFeedbackRequest(BaseModel):
    feedback_type: str  # ACKNOWLEDGE, MARK_BENIGN, MARK_EXPECTED, MARK_SUSPICIOUS, CONFIRM_INCIDENT
    notes: str = ""
    analyst_name: str = "Security Analyst"


class SimulationCreateRequest(BaseModel):
    scenario_name: str
    target_user_id: Optional[int] = None


class AppEventRequest(BaseModel):
    """Generic event-recording request used by all three mock applications.
    This mirrors the recordEvent() shape from the product spec - the same
    request body works for Social, Gmail, and Finance."""

    user_id: int
    event_type: str
    action: str
    resource_id: Optional[str] = None
    resource_type: Optional[str] = None
    resource_sensitivity: str = "INTERNAL"
    device_name: str = "Personal Laptop"
    location: Optional[str] = None
    data_volume: float = 0.0
    metadata: Optional[dict] = None


class SocialLoginRequest(BaseModel):
    device_name: str = "Personal Laptop"
    location: Optional[str] = None


class SocialPostRequest(BaseModel):
    content: str = ""
    device_name: str = "Personal Laptop"


class SocialMessageRequest(BaseModel):
    to_user_id: Optional[int] = None
    content: str = ""
    device_name: str = "Personal Laptop"


class SocialSettingsRequest(BaseModel):
    field: str
    value: str
    device_name: str = "Personal Laptop"


class GmailComposeRequest(BaseModel):
    to: str
    subject: str = ""
    body: str = ""
    device_name: str = "Personal Laptop"


class GmailSearchRequest(BaseModel):
    query: str
    device_name: str = "Personal Laptop"


class GmailForwardingRuleRequest(BaseModel):
    forward_to: str
    device_name: str = "Personal Laptop"


class FinanceTransferRequest(BaseModel):
    beneficiary_id: str
    amount: float
    device_name: str = "Personal Laptop"


class FinanceBeneficiaryRequest(BaseModel):
    name: str
    account_number: str
    device_name: str = "Personal Laptop"
