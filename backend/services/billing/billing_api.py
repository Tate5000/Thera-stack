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
class CPTCode(BaseModel):
    code: str
    description: str
    default_rate: Optional[float] = None

class DiagnosisCode(BaseModel):
    code: str
    description: str

class InsuranceProvider(BaseModel):
    id: str
    name: str
    payer_id: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

class Superbill(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    patient_name: str
    therapist_id: str
    therapist_name: str
    session_date: str
    cpt_codes: List[str]
    diagnosis_codes: List[str]
    amount: float
    insurance_provider: str
    status: str = "pending"  # pending, submitted, paid, denied
    submitted_date: Optional[str] = None
    claim_number: Optional[str] = None
    paid_date: Optional[str] = None
    paid_amount: Optional[float] = None
    denied_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class SuperbillCreate(BaseModel):
    patient_id: str
    patient_name: str
    therapist_id: str
    therapist_name: str
    session_date: str
    cpt_codes: List[str]
    diagnosis_codes: List[str]
    amount: float
    insurance_provider: str
    notes: Optional[str] = None

class SuperbillUpdate(BaseModel):
    status: Optional[str] = None
    submitted_date: Optional[str] = None
    claim_number: Optional[str] = None
    paid_date: Optional[str] = None
    paid_amount: Optional[float] = None
    denied_reason: Optional[str] = None
    notes: Optional[str] = None

# Mock data
superbills_db = {}
cpt_codes_db = {
    "90791": CPTCode(code="90791", description="Psychiatric diagnostic evaluation", default_rate=200.00),
    "90832": CPTCode(code="90832", description="Psychotherapy, 30 minutes", default_rate=75.00),
    "90834": CPTCode(code="90834", description="Psychotherapy, 45 minutes", default_rate=125.00),
    "90837": CPTCode(code="90837", description="Psychotherapy, 60 minutes", default_rate=175.00),
    "90853": CPTCode(code="90853", description="Group psychotherapy", default_rate=50.00)
}
diagnosis_codes_db = {
    "F32.9": DiagnosisCode(code="F32.9", description="Major depressive disorder, single episode, unspecified"),
    "F41.1": DiagnosisCode(code="F41.1", description="Generalized anxiety disorder"),
    "F43.1": DiagnosisCode(code="F43.1", description="Post-traumatic stress disorder"),
    "F40.10": DiagnosisCode(code="F40.10", description="Social anxiety disorder, unspecified"),
    "F33.1": DiagnosisCode(code="F33.1", description="Major depressive disorder, recurrent, moderate")
}
insurance_providers_db = {
    "ins1": InsuranceProvider(
        id="ins1",
        name="Blue Cross Blue Shield",
        payer_id="BCBS123",
        address="123 Insurance Way, Chicago, IL 60601",
        phone="800-555-1234",
        email="claims@bcbs.com",
        website="https://www.bcbs.com"
    ),
    "ins2": InsuranceProvider(
        id="ins2",
        name="Aetna",
        payer_id="AETNA456",
        address="456 Health Blvd, Hartford, CT 06103",
        phone="800-555-2345",
        email="claims@aetna.com",
        website="https://www.aetna.com"
    ),
    "ins3": InsuranceProvider(
        id="ins3",
        name="UnitedHealthcare",
        payer_id="UHC789",
        address="789 Medical Drive, Minneapolis, MN 55439",
        phone="800-555-3456",
        email="claims@uhc.com",
        website="https://www.uhc.com"
    )
}

# Initialize with sample data
def init_sample_data():
    # Sample superbills
    sample_bills = [
        Superbill(
            id="sb1",
            patient_id="p1",
            patient_name="Alice Johnson",
            therapist_id="doctor1",
            therapist_name="Dr. Sarah Johnson",
            session_date="2025-03-20",
            cpt_codes=["90834", "90837"],
            diagnosis_codes=["F41.1", "F32.9"],
            amount=150.00,
            insurance_provider="Blue Cross Blue Shield",
            status="pending",
            created_at="2025-03-21T10:30:00Z",
            updated_at="2025-03-21T10:30:00Z"
        ),
        Superbill(
            id="sb2",
            patient_id="p2",
            patient_name="Robert Smith",
            therapist_id="doctor2",
            therapist_name="Dr. Michael Lee",
            session_date="2025-03-19",
            cpt_codes=["90791"],
            diagnosis_codes=["F43.1"],
            amount=200.00,
            insurance_provider="Aetna",
            status="submitted",
            submitted_date="2025-03-20",
            claim_number="CLM-20250320-1234",
            created_at="2025-03-19T14:20:00Z",
            updated_at="2025-03-20T09:15:00Z"
        ),
        Superbill(
            id="sb3",
            patient_id="p3",
            patient_name="Emily Davis",
            therapist_id="doctor1",
            therapist_name="Dr. Sarah Johnson",
            session_date="2025-03-18",
            cpt_codes=["90834"],
            diagnosis_codes=["F40.10"],
            amount=125.00,
            insurance_provider="UnitedHealthcare",
            status="paid",
            submitted_date="2025-03-19",
            claim_number="CLM-20250319-5678",
            paid_date="2025-03-25",
            paid_amount=100.00,
            created_at="2025-03-18T16:45:00Z",
            updated_at="2025-03-25T11:20:00Z"
        )
    ]
    
    # Add to database
    for bill in sample_bills:
        superbills_db[bill.id] = bill

# Initialize data
init_sample_data()

# Create router
router = APIRouter(
    prefix="/api/billing",
    tags=["billing"],
    responses={404: {"description": "Not found"}},
)

# Routes
@router.get("/superbills", response_model=List[Superbill])
async def get_superbills(
    patient_id: Optional[str] = None,
    therapist_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get all superbills, optionally filtered"""
    bills = list(superbills_db.values())
    
    # Apply filters
    if patient_id:
        bills = [bill for bill in bills if bill.patient_id == patient_id]
    
    if therapist_id:
        bills = [bill for bill in bills if bill.therapist_id == therapist_id]
    
    if status:
        bills = [bill for bill in bills if bill.status == status]
    
    if start_date:
        bills = [bill for bill in bills if bill.session_date >= start_date]
    
    if end_date:
        bills = [bill for bill in bills if bill.session_date <= end_date]
    
    # Sort by session date (newest first)
    bills.sort(key=lambda x: x.session_date, reverse=True)
    
    return bills

@router.get("/superbills/{superbill_id}", response_model=Superbill)
async def get_superbill(superbill_id: str):
    """Get a specific superbill by ID"""
    if superbill_id not in superbills_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Superbill with ID {superbill_id} not found"
        )
    
    return superbills_db[superbill_id]

@router.post("/superbills", response_model=Superbill, status_code=status.HTTP_201_CREATED)
async def create_superbill(superbill: SuperbillCreate):
    """Create a new superbill"""
    # Create new superbill with default fields
    new_bill = Superbill(
        **superbill.dict(),
        id=f"sb{len(superbills_db) + 1}",
        status="pending",
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    
    # Add to database
    superbills_db[new_bill.id] = new_bill
    
    return new_bill

@router.put("/superbills/{superbill_id}", response_model=Superbill)
async def update_superbill(superbill_id: str, updates: SuperbillUpdate):
    """Update an existing superbill"""
    if superbill_id not in superbills_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Superbill with ID {superbill_id} not found"
        )
    
    # Get existing bill
    bill = superbills_db[superbill_id]
    
    # Update fields
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(bill, key, value)
    
    # Update timestamp
    bill.updated_at = datetime.now().isoformat()
    
    return bill

@router.post("/superbills/{superbill_id}/submit", response_model=Superbill)
async def submit_superbill(superbill_id: str):
    """Submit a superbill to insurance"""
    if superbill_id not in superbills_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Superbill with ID {superbill_id} not found"
        )
    
    bill = superbills_db[superbill_id]
    
    # Check if already submitted
    if bill.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Superbill is already {bill.status}"
        )
    
    # Update status
    today = datetime.now().strftime("%Y-%m-%d")
    bill.status = "submitted"
    bill.submitted_date = today
    bill.claim_number = f"CLM-{today.replace('-', '')}-{uuid.uuid4().hex[:4].upper()}"
    bill.updated_at = datetime.now().isoformat()
    
    return bill

@router.get("/cpt-codes", response_model=List[CPTCode])
async def get_cpt_codes():
    """Get all CPT codes"""
    return list(cpt_codes_db.values())

@router.get("/cpt-codes/{code}", response_model=CPTCode)
async def get_cpt_code(code: str):
    """Get a specific CPT code"""
    if code not in cpt_codes_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CPT code {code} not found"
        )
    
    return cpt_codes_db[code]

@router.get("/diagnosis-codes", response_model=List[DiagnosisCode])
async def get_diagnosis_codes():
    """Get all diagnosis codes"""
    return list(diagnosis_codes_db.values())

@router.get("/diagnosis-codes/{code}", response_model=DiagnosisCode)
async def get_diagnosis_code(code: str):
    """Get a specific diagnosis code"""
    if code not in diagnosis_codes_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnosis code {code} not found"
        )
    
    return diagnosis_codes_db[code]

@router.get("/insurance-providers", response_model=List[InsuranceProvider])
async def get_insurance_providers():
    """Get all insurance providers"""
    return list(insurance_providers_db.values())

@router.get("/insurance-providers/{provider_id}", response_model=InsuranceProvider)
async def get_insurance_provider(provider_id: str):
    """Get a specific insurance provider"""
    if provider_id not in insurance_providers_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insurance provider with ID {provider_id} not found"
        )
    
    return insurance_providers_db[provider_id]