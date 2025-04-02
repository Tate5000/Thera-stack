from fastapi import APIRouter, HTTPException, Depends, Body, Query, status
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import logging
import json
from pydantic import BaseModel, Field

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    sender: str  # user or ai
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None

class AssistantContext(BaseModel):
    has_access: bool = True
    user_id: str
    user_role: str
    accessible_data: List[str]
    timezone: str = "UTC"
    metadata: Optional[Dict[str, Any]] = None

class SendMessageRequest(BaseModel):
    user_id: str
    content: str
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# In-memory database for messages
message_history = {}

# Sample AI responses based on keywords in the message
def get_ai_response(message: str, context: AssistantContext) -> str:
    lowerMessage = message.lower()
    
    # Check for scheduling/appointment related keywords
    if any(keyword in lowerMessage for keyword in ['schedule', 'appointment', 'book']):
        if context.user_role == 'patient':
            return "I can help you schedule an appointment. Based on your therapy plan, I see you typically meet weekly. I have availability next Tuesday at 2:00 PM or Wednesday at 10:00 AM. Would either of those work for you?"
        else:
            return "I can help manage your appointment schedule. Would you like to view upcoming appointments, schedule a new session, or check availability for a specific date?"
    
    # Check for billing/payment related keywords
    if any(keyword in lowerMessage for keyword in ['bill', 'payment', 'insurance', 'cost']):
        if context.user_role == 'patient':
            return "Your next payment of $75.00 is due on April 15th. Your insurance typically covers 80% of your session cost. Would you like me to show your payment history or help you set up automatic payments?"
        elif context.user_role == 'doctor':
            return "I can help with billing information for your patients. Would you like to check payment status for a specific patient, create a superbill, or review your outstanding claims?"
        else:
            return "I can provide information about billing and payments across the system. Would you like to see payment statistics, insurance claim status, or financial reports?"
    
    # Check for session history related keywords
    if any(keyword in lowerMessage for keyword in ['session', 'history', 'previous']):
        if context.user_role == 'patient':
            return "Looking at your session history, you've had 8 sessions so far. Your last session was on March 25th where you discussed anxiety management techniques. Your therapist noted good progress with the breathing exercises. Would you like more details about a specific session?"
        elif context.user_role == 'doctor':
            return "I can help you access session histories for your patients. Which patient's records would you like to review?"
        else:
            return "As an administrator, you have access to all session records. Would you like to search by patient, therapist, date range, or session type?"
    
    # Check for emotional support or therapy-related keywords
    if any(keyword in lowerMessage for keyword in ['anxious', 'anxiety', 'stress', 'worried']):
        return "I understand you're feeling anxious. Many people experience anxiety, and it's important to acknowledge these feelings. Would you like to try a quick breathing exercise that many patients find helpful? Or I can share information about your upcoming therapy session where you can discuss this further with your therapist."
    
    if any(keyword in lowerMessage for keyword in ['sad', 'depress', 'down']):
        return "I'm sorry to hear you're feeling down. It's important to talk about these feelings with your therapist. Your next session is scheduled for April 5th, but if you need support sooner, I can help you schedule an earlier appointment or connect you with crisis resources if needed."
    
    # Default responses based on user role
    patient_responses = [
        "How can I help with your therapy journey today? I can assist with scheduling, payments, or therapy resources.",
        "Is there anything specific about your treatment plan you'd like to discuss?",
        "Would you like me to make a note for your therapist about this for your next session?"
    ]
    
    doctor_responses = [
        "How can I help you with patient management today? I can assist with scheduling, patient records, or billing.",
        "Would you like me to retrieve information about a specific patient or session?",
        "Is there anything else you need assistance with regarding your practice management?"
    ]
    
    admin_responses = [
        "How can I help you with system management today? I can assist with user accounts, system settings, or analytics.",
        "Would you like me to generate reports or provide system statistics?",
        "Is there a specific administrative task you need assistance with?"
    ]
    
    # Select response based on user role
    import random
    if context.user_role == 'patient':
        return random.choice(patient_responses)
    elif context.user_role == 'doctor':
        return random.choice(doctor_responses)
    elif context.user_role == 'admin':
        return random.choice(admin_responses)
    else:
        return "I'm here to assist with your therapy experience. How can I help you today?"

# Initialize with welcome messages for each user
def init_welcome_messages():
    # Sample users (should match with your authentication system)
    user_ids = ['patient1', 'doctor1', 'admin1']
    
    # Create welcome message for each user
    for user_id in user_ids:
        if user_id not in message_history:
            message_history[user_id] = []
            
            welcome_message = Message(
                content="Hello! I'm your AI therapy assistant. How can I help you today?",
                sender="ai"
            )
            
            message_history[user_id].append(welcome_message)

# Initialize messages
init_welcome_messages()

# Create router
router = APIRouter(
    prefix="/api/ai-assistant",
    tags=["ai-assistant"],
    responses={404: {"description": "Not found"}},
)

# Routes
@router.get("/context", response_model=AssistantContext)
async def get_assistant_context(user_id: str):
    """Get context information for the AI assistant"""
    # Determine user role based on the user ID prefix
    # In a real app, this would come from your user management system
    if user_id.startswith('p'):
        user_role = 'patient'
        accessible_data = ['appointments', 'billing', 'session_history']
    elif user_id.startswith('d'):
        user_role = 'doctor'
        accessible_data = ['appointments', 'patient_records', 'billing', 'session_history']
    elif user_id.startswith('a'):
        user_role = 'admin'
        accessible_data = ['all_appointments', 'user_management', 'system_settings', 'billing', 'analytics']
    else:
        user_role = 'unknown'
        accessible_data = ['limited']
    
    context = AssistantContext(
        user_id=user_id,
        user_role=user_role,
        accessible_data=accessible_data,
        timezone="America/New_York",
        metadata={
            "lastLogin": datetime.now().isoformat(),
            "sessionCount": 12,
            "preferredCommunication": "chat"
        }
    )
    
    return context

@router.get("/messages", response_model=List[Message])
async def get_message_history(user_id: str, limit: int = 50):
    """Get message history for a user"""
    # Check if user exists in message history
    if user_id not in message_history:
        # Initialize with welcome message if not
        welcome_message = Message(
            content="Hello! I'm your AI therapy assistant. How can I help you today?",
            sender="ai"
        )
        
        message_history[user_id] = [welcome_message]
    
    # Return most recent messages up to the limit
    return message_history[user_id][-limit:]

@router.post("/messages", response_model=Message)
async def send_message(request: SendMessageRequest):
    """Send a message to the AI assistant and get a response"""
    # Record user message
    user_message = Message(
        content=request.content,
        sender="user",
        metadata=request.metadata
    )
    
    # Initialize message history for user if not exists
    if request.user_id not in message_history:
        message_history[request.user_id] = []
    
    # Add user message to history
    message_history[request.user_id].append(user_message)
    
    # Get context for AI response
    context = await get_assistant_context(request.user_id)
    
    # Generate AI response
    ai_response_text = get_ai_response(request.content, context)
    
    # Create AI message
    ai_message = Message(
        content=ai_response_text,
        sender="ai"
    )
    
    # Add AI message to history
    message_history[request.user_id].append(ai_message)
    
    # Return the AI message
    return ai_message

@router.delete("/messages")
async def clear_message_history(user_id: str):
    """Clear message history for a user"""
    if user_id in message_history:
        message_history[user_id] = []
    
    # Add welcome message
    welcome_message = Message(
        content="Hello! I'm your AI therapy assistant. How can I help you today?",
        sender="ai"
    )
    
    message_history[user_id] = [welcome_message]
    
    return {"status": "success", "message": "Message history cleared"}