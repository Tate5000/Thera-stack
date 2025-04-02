import os
from datetime import datetime
import uuid
from .calendar_schema import Appointment

# In-memory database for development
appointments_db = {}

# Mock data
mock_appointments = [
    {
        "appointment_id": "appt-001",
        "patient_id": "patient1",
        "patient_name": "Alex Garcia",
        "therapist_id": "therapist1",
        "therapist_name": "Dr. Sarah Johnson",
        "start_time": "2025-04-01T10:00:00Z",
        "end_time": "2025-04-01T11:00:00Z",
        "title": "Initial Consultation",
        "notes": "First session with patient",
        "status": "scheduled",
        "appointment_type": "initial"
    },
    {
        "appointment_id": "appt-002",
        "patient_id": "patient2",
        "patient_name": "Jordan Smith",
        "therapist_id": "therapist2",
        "therapist_name": "Dr. Michael Lee",
        "start_time": "2025-04-02T14:00:00Z",
        "end_time": "2025-04-02T15:00:00Z",
        "title": "Follow-up Session",
        "notes": "Review progress from last week",
        "status": "scheduled",
        "appointment_type": "followup"
    },
    {
        "appointment_id": "appt-003",
        "patient_id": "patient3",
        "patient_name": "Taylor Brown",
        "therapist_id": "therapist3",
        "therapist_name": "Dr. Emily Chen",
        "start_time": "2025-04-03T09:00:00Z",
        "end_time": "2025-04-03T10:00:00Z",
        "title": "Therapy Session",
        "notes": "Addressing anxiety management techniques",
        "status": "scheduled",
        "appointment_type": "standard"
    }
]

# Initialize mock data
for appt in mock_appointments:
    appointments_db[appt["appointment_id"]] = appt

def create_appointment(appt: Appointment):
    """Create a new appointment"""
    try:
        item = appt.model_dump()
        
        # Generate ID if not provided
        if not item.get('appointment_id'):
            item['appointment_id'] = f"appt-{uuid.uuid4().hex[:8]}"
            
        # Convert datetime to string
        if isinstance(item['start_time'], datetime):
            item['start_time'] = appt.start_time.isoformat()
            
        if isinstance(item['end_time'], datetime):
            item['end_time'] = appt.end_time.isoformat()
            
        appointments_db[item['appointment_id']] = item
        return {"message": "Appointment created", "appointment_id": item['appointment_id']}
    except Exception as e:
        raise Exception(f"Error creating appointment: {str(e)}")

def get_appointment(appointment_id: str):
    """Get an appointment by ID"""
    try:
        return appointments_db.get(appointment_id)
    except Exception as e:
        raise Exception(f"Error retrieving appointment: {str(e)}")

def list_appointments_by_therapist(therapist_id: str):
    """List appointments by therapist ID"""
    try:
        return [appt for appt in appointments_db.values() if appt['therapist_id'] == therapist_id]
    except Exception as e:
        raise Exception(f"Error listing appointments: {str(e)}")

def list_appointments_by_patient(patient_id: str):
    """List appointments by patient ID"""
    try:
        return [appt for appt in appointments_db.values() if appt['patient_id'] == patient_id]
    except Exception as e:
        raise Exception(f"Error listing appointments: {str(e)}")
        
def list_all_appointments():
    """List all appointments"""
    try:
        return list(appointments_db.values())
    except Exception as e:
        raise Exception(f"Error listing appointments: {str(e)}")
        
def update_appointment_status(appointment_id: str, status: str):
    """Update appointment status"""
    try:
        if appointment_id not in appointments_db:
            raise Exception("Appointment not found")
            
        appointments_db[appointment_id]['status'] = status
        return {"status": status}
    except Exception as e:
        raise Exception(f"Error updating appointment: {str(e)}")