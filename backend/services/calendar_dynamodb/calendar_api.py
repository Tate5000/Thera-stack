from fastapi import APIRouter, HTTPException, Body
from .calendar_schema import Appointment, AppointmentUpdate
from .calendar_db import (
    create_appointment, 
    get_appointment, 
    list_appointments_by_therapist,
    list_appointments_by_patient,
    list_all_appointments,
    update_appointment_status
)

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.post("/create")
def schedule(appt: Appointment):
    try:
        return create_appointment(appt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{appointment_id}")
def read_appointment(appointment_id: str):
    appt = get_appointment(appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt

@router.get("/therapist/{therapist_id}")
def get_by_therapist(therapist_id: str):
    try:
        return list_appointments_by_therapist(therapist_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("/patient/{patient_id}")
def get_by_patient(patient_id: str):
    try:
        return list_appointments_by_patient(patient_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("/all")
def get_all_appointments():
    try:
        return list_all_appointments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.patch("/{appointment_id}/status")
def update_status(appointment_id: str, update: AppointmentUpdate):
    try:
        appt = get_appointment(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        result = update_appointment_status(appointment_id, update.status)
        return {"message": "Appointment updated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
