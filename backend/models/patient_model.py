from pydantic import BaseModel, Field
from typing import List, Optional

class PatientInput(BaseModel):
    patient_name: str
    age: int = Field(ge=0, le=150)
    symptoms: List[str]
    oxygen: Optional[int] = None
    bp: Optional[str] = None
    heart_rate: Optional[int] = None
    notes: Optional[str] = ""
    location: Optional[str] = "Unknown"
    image_url: Optional[str] = None