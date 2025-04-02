import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add the backend directory to the path so we can import from it
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

from main import app

client = TestClient(app)

def test_user_login_and_calendar_access():
    """Test user login and accessing calendar endpoints"""
    # 1. Login
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    login_response = client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "accessToken" in token_data
    
    # Extract the access token
    access_token = token_data["accessToken"]
    
    # 2. Use the token to access calendar
    headers = {"Authorization": f"Bearer {access_token}"}
    calendar_response = client.get("/api/calendar/events", headers=headers)
    assert calendar_response.status_code == 200
    
    # 3. Logout
    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 200
    
    # 4. Verify we can't access calendar after logout
    failed_response = client.get("/api/calendar/events", headers=headers)
    assert failed_response.status_code in [401, 403]  # Unauthorized or Forbidden