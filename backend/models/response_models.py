from pydantic import BaseModel
from typing import List, Optional

class IntakeResponse(BaseModel):
    summary: str
    possible_condition: str
    emergency_level: str
    risk_indicators: List[str]

class ImagingResponse(BaseModel):
    anomaly_detected: bool
    confidence_score: int
    finding: str
    highlight_region: Optional[str] = None

class TriageResponse(BaseModel):
    severity: str
    priority: str
    risk_score: int
    recommendation: str
    reasoning: List[str]

class LogisticsResponse(BaseModel):
    nearest_hospital: str
    urgency: str
    estimated_response: str
    transfer_notes: Optional[str] = None

class PatientRecord(BaseModel):
    patient_id: str
    patient_name: str
    age: int
    symptoms: List[str]
    vitals: dict
    notes: Optional[str]
    location: Optional[str]
    intake: Optional[IntakeResponse]
    imaging: Optional[ImagingResponse]
    triage: Optional[TriageResponse]
    logistics: Optional[LogisticsResponse]
    timestamp: float
    status: str = "active"