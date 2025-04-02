from fastapi import APIRouter, HTTPException, Depends, Body, Query, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import logging
import json
from pydantic import BaseModel, Field

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class PatientInfo(BaseModel):
    id: str
    name: str
    email: str

class TherapistInfo(BaseModel):
    id: str
    name: str
    email: str

class CallVerification(BaseModel):
    callId: str
    patientId: str
    verified: bool
    verificationMethod: str = "manual"
    verifiedAt: datetime = Field(default_factory=datetime.now)
    
class CallStatus(BaseModel):
    callId: str
    status: str
    aiStatus: str
    updatedAt: datetime = Field(default_factory=datetime.now)
    updatedBy: str

class CallSummary(BaseModel):
    callId: str
    summaryText: str
    keyPoints: List[str]
    actionItems: Optional[List[str]] = None
    aiAssisted: bool = True
    generatedAt: datetime = Field(default_factory=datetime.now)

class MCPConfig(BaseModel):
    enableMCP: bool = True
    autoVerify: bool = False
    autoSummarize: bool = True
    accessLevel: str = "restricted"
    maxSessionsToReview: int = 3
    triggerPhrases: List[str] = []

class CallDetail(BaseModel):
    id: str
    patientId: str
    patientName: str
    therapistId: str
    therapistName: str
    scheduledStartTime: datetime
    scheduledEndTime: Optional[datetime] = None
    actualStartTime: Optional[datetime] = None 
    actualEndTime: Optional[datetime] = None
    duration: Optional[int] = None
    status: str  # scheduled, in-progress, completed, cancelled
    verified: bool = False
    aiStatus: str = "pending"  # pending, active, disabled
    summary: Optional[CallSummary] = None
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# In-memory storage (would be replaced with database in production)
active_calls = {}
call_history = {}
mcp_config = MCPConfig(
    enableMCP=True,
    autoVerify=False,
    autoSummarize=True,
    accessLevel="restricted",
    maxSessionsToReview=3,
    triggerPhrases=[
        "schedule appointment",
        "payment options",
        "insurance claim",
        "book session",
        "reschedule"
    ]
)

# Create router
router = APIRouter(
    prefix="/api/call-manager",
    tags=["call-manager"],
    responses={404: {"description": "Not found"}},
)

# Helper functions
def generate_mock_calls():
    """Generate mock call data for testing"""
    now = datetime.now()
    
    # Active calls
    active_call_1 = CallDetail(
        id=str(uuid.uuid4()),
        patientId="p1",
        patientName="Jane Smith",
        therapistId="d1",
        therapistName="Dr. Michael Brown",
        scheduledStartTime=now - timedelta(minutes=15),
        scheduledEndTime=now + timedelta(minutes=30),
        actualStartTime=now - timedelta(minutes=15),
        status="in-progress",
        verified=True,
        aiStatus="active"
    )
    
    active_call_2 = CallDetail(
        id=str(uuid.uuid4()),
        patientId="p2",
        patientName="Robert Johnson",
        therapistId="d2",
        therapistName="Dr. Sarah Wilson",
        scheduledStartTime=now - timedelta(minutes=5),
        scheduledEndTime=now + timedelta(minutes=25),
        actualStartTime=now - timedelta(minutes=5),
        status="in-progress",
        verified=True,
        aiStatus="active"
    )
    
    # Upcoming calls
    upcoming_call_1 = CallDetail(
        id=str(uuid.uuid4()),
        patientId="p3",
        patientName="Michael Davis",
        therapistId="d3",
        therapistName="Dr. Lisa Chen",
        scheduledStartTime=now + timedelta(minutes=30),
        scheduledEndTime=now + timedelta(minutes=90),
        status="scheduled",
        verified=False,
        aiStatus="pending"
    )
    
    upcoming_call_2 = CallDetail(
        id=str(uuid.uuid4()),
        patientId="p4",
        patientName="Emily Wilson",
        therapistId="d1",
        therapistName="Dr. Michael Brown",
        scheduledStartTime=now + timedelta(hours=2),
        scheduledEndTime=now + timedelta(hours=2, minutes=45),
        status="scheduled",
        verified=False,
        aiStatus="pending"
    )
    
    upcoming_call_3 = CallDetail(
        id=str(uuid.uuid4()),
        patientId="p5",
        patientName="Thomas Jefferson",
        therapistId="d2",
        therapistName="Dr. Sarah Wilson",
        scheduledStartTime=now + timedelta(hours=3),
        scheduledEndTime=now + timedelta(hours=3, minutes=30),
        status="scheduled",
        verified=False,
        aiStatus="pending"
    )
    
    # Store active and upcoming calls
    active_calls[active_call_1.id] = active_call_1
    active_calls[active_call_2.id] = active_call_2
    active_calls[upcoming_call_1.id] = upcoming_call_1
    active_calls[upcoming_call_2.id] = upcoming_call_2
    active_calls[upcoming_call_3.id] = upcoming_call_3
    
    # Historical calls
    past_call_1 = CallDetail(
        id=str(uuid.uuid4()),
        patientId="p1",
        patientName="Jane Smith",
        therapistId="d1",
        therapistName="Dr. Michael Brown",
        scheduledStartTime=now - timedelta(days=2),
        scheduledEndTime=now - timedelta(days=2, minutes=-45),
        actualStartTime=now - timedelta(days=2),
        actualEndTime=now - timedelta(days=2, minutes=-45),
        duration=45,
        status="completed",
        verified=True,
        aiStatus="active",
        summary=CallSummary(
            callId=str(uuid.uuid4()),
            summaryText="Discussed anxiety management techniques. Patient made good progress with breathing exercises.",
            keyPoints=[
                "Breathing exercises helped with work anxiety",
                "Successfully managed stress during presentation",
                "Planning to practice mindfulness daily"
            ],
            actionItems=[
                "Continue breathing exercises",
                "Add mindfulness practice",
                "Track anxiety triggers"
            ],
            aiAssisted=True
        )
    )
    
    past_call_2 = CallDetail(
        id=str(uuid.uuid4()),
        patientId="p2",
        patientName="Robert Johnson",
        therapistId="d2",
        therapistName="Dr. Sarah Wilson",
        scheduledStartTime=now - timedelta(days=3),
        scheduledEndTime=now - timedelta(days=3, minutes=-30),
        actualStartTime=now - timedelta(days=3),
        actualEndTime=now - timedelta(days=3, minutes=-30),
        duration=30,
        status="completed",
        verified=True,
        aiStatus="active",
        summary=CallSummary(
            callId=str(uuid.uuid4()),
            summaryText="Payment plan discussed. Patient agreed to monthly payment schedule for therapy sessions.",
            keyPoints=[
                "Reviewed insurance coverage options",
                "Set up payment plan for remaining balance",
                "Discussed superbill submission process"
            ],
            actionItems=[
                "Submit superbill to insurance",
                "Schedule automatic payments",
                "Contact insurance for additional coverage"
            ],
            aiAssisted=True
        )
    )
    
    past_call_3 = CallDetail(
        id=str(uuid.uuid4()),
        patientId="p3",
        patientName="Michael Davis",
        therapistId="d3",
        therapistName="Dr. Lisa Chen",
        scheduledStartTime=now - timedelta(days=4),
        scheduledEndTime=now - timedelta(days=4, minutes=-60),
        actualStartTime=now - timedelta(days=4),
        actualEndTime=now - timedelta(days=4, minutes=-60),
        duration=60,
        status="completed",
        verified=True,
        aiStatus="active",
        summary=CallSummary(
            callId=str(uuid.uuid4()),
            summaryText="Initial assessment completed. Treatment plan established with weekly sessions.",
            keyPoints=[
                "Completed initial assessment",
                "Identified primary concern areas",
                "Discussed therapy approach and goals",
                "Scheduled future appointments"
            ],
            actionItems=[
                "Complete intake paperwork",
                "Review therapy agreement",
                "Begin weekly session schedule"
            ],
            aiAssisted=True
        )
    )
    
    # Store historical calls
    call_history[past_call_1.id] = past_call_1
    call_history[past_call_2.id] = past_call_2
    call_history[past_call_3.id] = past_call_3

# Initialize mock data
generate_mock_calls()

# Routes
@router.get("/active-calls", response_model=List[CallDetail])
async def get_active_calls(
    status: Optional[str] = Query(None, description="Filter by call status")
):
    """Get all active and upcoming calls"""
    result = list(active_calls.values())
    
    if status:
        result = [call for call in result if call.status == status]
        
    # Sort by scheduled start time
    result.sort(key=lambda x: x.scheduledStartTime)
    
    return result

@router.get("/call-history", response_model=List[CallDetail])
async def get_call_history(
    patientId: Optional[str] = Query(None, description="Filter by patient ID"),
    therapistId: Optional[str] = Query(None, description="Filter by therapist ID"),
    startDate: Optional[datetime] = Query(None, description="Filter by start date"),
    endDate: Optional[datetime] = Query(None, description="Filter by end date")
):
    """Get call history with optional filters"""
    result = list(call_history.values())
    
    if patientId:
        result = [call for call in result if call.patientId == patientId]
        
    if therapistId:
        result = [call for call in result if call.therapistId == therapistId]
        
    if startDate:
        result = [call for call in result if call.scheduledStartTime >= startDate]
        
    if endDate:
        result = [call for call in result if call.scheduledStartTime <= endDate]
    
    # Sort by scheduled start time (newest first)
    result.sort(key=lambda x: x.scheduledStartTime, reverse=True)
    
    return result

@router.get("/calls/{call_id}", response_model=CallDetail)
async def get_call_detail(call_id: str):
    """Get details for a specific call"""
    if call_id in active_calls:
        return active_calls[call_id]
    elif call_id in call_history:
        return call_history[call_id]
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call with ID {call_id} not found"
        )

@router.post("/calls/{call_id}/verify", response_model=CallDetail)
async def verify_call(call_id: str, verification: CallVerification):
    """Verify a patient's identity for a call"""
    if call_id not in active_calls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call with ID {call_id} not found"
        )
    
    if active_calls[call_id].patientId != verification.patientId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient ID mismatch"
        )
    
    # Update call verification status
    active_calls[call_id].verified = verification.verified
    active_calls[call_id].updatedAt = datetime.now()
    
    logger.info(f"Call {call_id} verification status updated to {verification.verified}")
    
    return active_calls[call_id]

@router.post("/calls/{call_id}/status", response_model=CallDetail)
async def update_call_status(call_id: str, status_update: CallStatus):
    """Update the status of a call (including AI status)"""
    if call_id not in active_calls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call with ID {call_id} not found"
        )
    
    # Update call status
    call = active_calls[call_id]
    call.status = status_update.status
    call.aiStatus = status_update.aiStatus
    call.updatedAt = datetime.now()
    
    # Handle call completion
    if status_update.status == "completed":
        call.actualEndTime = datetime.now()
        if call.actualStartTime:
            # Calculate duration in minutes
            duration = int((call.actualEndTime - call.actualStartTime).total_seconds() / 60)
            call.duration = duration
        
        # Move to call history
        call_history[call_id] = call
        del active_calls[call_id]
    
    logger.info(f"Call {call_id} status updated to {status_update.status}, AI status: {status_update.aiStatus}")
    
    if call_id in active_calls:
        return active_calls[call_id]
    else:
        return call_history[call_id]

@router.post("/calls/{call_id}/join")
async def join_call(call_id: str):
    """Join a call as an admin/supervisor"""
    if call_id not in active_calls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call with ID {call_id} not found"
        )
    
    # In a real implementation, this would return connection details
    # For now, we'll just return a success message
    return {"status": "success", "message": f"Successfully joined call {call_id}"}

@router.post("/calls/{call_id}/summary", response_model=CallSummary)
async def generate_call_summary(call_id: str):
    """Generate a summary for a completed call"""
    if call_id not in call_history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call with ID {call_id} not found or not completed"
        )
    
    call = call_history[call_id]
    
    # Generate a mock summary based on keywords in call details
    summary_text = "Session focused on progress review and treatment planning."
    key_points = ["Reviewed progress since last session", "Discussed treatment goals"]
    action_items = ["Continue with homework assignments", "Practice coping strategies"]
    
    if "anxiety" in call.patientName.lower():
        summary_text = "Session focused on anxiety management techniques and progress review."
        key_points = ["Breathing exercises working well", "Reduced anxiety in social situations"]
        action_items = ["Continue daily mindfulness practice", "Use grounding techniques when anxious"]
    elif "depression" in call.patientName.lower():
        summary_text = "Session addressed depressive symptoms and behavioral activation strategies."
        key_points = ["Slight improvement in mood", "Successfully engaged in planned activities"]
        action_items = ["Maintain activity schedule", "Monitor mood changes"]
    
    # Create and store summary
    summary = CallSummary(
        callId=call_id,
        summaryText=summary_text,
        keyPoints=key_points,
        actionItems=action_items,
        aiAssisted=True,
        generatedAt=datetime.now()
    )
    
    call.summary = summary
    
    logger.info(f"Summary generated for call {call_id}")
    
    return summary

@router.get("/mcp-config", response_model=MCPConfig)
async def get_mcp_config():
    """Get the current MCP configuration"""
    return mcp_config

@router.post("/mcp-config", response_model=MCPConfig)
async def update_mcp_config(config: MCPConfig):
    """Update the MCP configuration"""
    global mcp_config
    mcp_config = config
    
    logger.info(f"MCP configuration updated: {json.dumps(config.dict(), default=str)}")
    
    return mcp_config

@router.post("/create-call", response_model=CallDetail)
async def create_call(
    patientId: str = Body(...),
    patientName: str = Body(...),
    therapistId: str = Body(...),
    therapistName: str = Body(...),
    scheduledStartTime: datetime = Body(...),
    scheduledEndTime: Optional[datetime] = Body(None),
    status: str = Body("scheduled")
):
    """Create a new call entry"""
    call_id = str(uuid.uuid4())
    
    new_call = CallDetail(
        id=call_id,
        patientId=patientId,
        patientName=patientName,
        therapistId=therapistId,
        therapistName=therapistName,
        scheduledStartTime=scheduledStartTime,
        scheduledEndTime=scheduledEndTime,
        status=status,
        verified=False,
        aiStatus="pending" if mcp_config.enableMCP else "disabled"
    )
    
    active_calls[call_id] = new_call
    
    logger.info(f"New call created with ID {call_id}")
    
    return new_call