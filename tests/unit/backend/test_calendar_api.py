import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add the backend directory to the path so we can import from it
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../backend')))

from main import app

client = TestClient(app)

def test_get_calendar_events():
    """Test get calendar events endpoint"""
    response = client.get("/api/calendar/events")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Further assertions can be added once we know the exact structure

def test_create_calendar_event():
    """Test creating a calendar event"""
    event_data = {
        "title": "Test Appointment",
        "start": "2025-04-02T10:00:00.000Z",
        "end": "2025-04-02T11:00:00.000Z",
        "patientId": "test-patient-id",
        "doctorId": "test-doctor-id"
    }
    response = client.post("/api/calendar/events", json=event_data)
    assert response.status_code in [200, 201]  # Depending on the API design
    data = response.json()
    assert "id" in data
    assert data["title"] == event_data["title"]