from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class Appointment(BaseModel):
    appointment_id: str
    patient_id: str
    therapist_id: str
    start_time: datetime
    end_time: datetime
    title: Optional[str] = "Therapy Session"
    notes: Optional[str] = None
    status: str = "scheduled"  # scheduled, canceled, completed
    patient_name: Optional[str] = None
    therapist_name: Optional[str] = None
    appointment_type: Optional[str] = "standard"  # standard, initial, follow-up

class AppointmentUpdate(BaseModel):
    status: str = Field(..., description="New appointment status") 
    
class AppointmentResponse(BaseModel):
    appointment_id: str
    title: str
    start_time: datetime
    end_time: datetime
    patient_id: str
    therapist_id: str
    patient_name: Optional[str] = None
    therapist_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
