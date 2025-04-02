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
class PaymentMethod(BaseModel):
    id: str
    user_id: str
    type: str  # card, bank, other
    name: str
    last4: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
    is_default: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    patient_name: str
    therapist_id: str
    therapist_name: str
    amount: float
    due_date: str
    paid_date: Optional[str] = None
    status: str = "upcoming"  # upcoming, paid, overdue
    type: str  # session, package, copay, other
    description: str
    session_date: Optional[str] = None
    session_dates: Optional[List[str]] = None
    insurance_coverage: Optional[float] = None
    patient_responsibility: Optional[float] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class PaymentCreate(BaseModel):
    patient_id: str
    patient_name: str
    therapist_id: str
    therapist_name: str
    amount: float
    due_date: str
    type: str
    description: str
    session_date: Optional[str] = None
    session_dates: Optional[List[str]] = None
    insurance_coverage: Optional[float] = None
    patient_responsibility: Optional[float] = None
    notes: Optional[str] = None

class PaymentUpdate(BaseModel):
    paid_date: Optional[str] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentMethodCreate(BaseModel):
    user_id: str
    type: str
    name: str
    last4: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
    is_default: bool = False

class ProcessPaymentRequest(BaseModel):
    payment_id: str
    payment_method_id: str
    amount: float

# Mock databases
payments_db = {}
payment_methods_db = {}

# Initialize with sample data
def init_sample_data():
    # Sample payment methods
    methods = [
        PaymentMethod(
            id="pm1",
            user_id="p1",
            type="card",
            name="Visa ending in 4242",
            last4="4242",
            exp_month=12,
            exp_year=2025,
            is_default=True,
            created_at="2025-01-15T10:30:00Z"
        ),
        PaymentMethod(
            id="pm2",
            user_id="p1",
            type="bank",
            name="Chase Checking Account",
            last4="6789",
            is_default=False,
            created_at="2025-02-20T14:45:00Z"
        )
    ]
    
    # Sample payments
    payments = [
        Payment(
            id="pay1",
            patient_id="p1",
            patient_name="Alice Johnson",
            therapist_id="doctor1",
            therapist_name="Dr. Sarah Johnson",
            amount=150.00,
            due_date="2025-04-15",
            status="upcoming",
            type="session",
            description="Individual Therapy Session (45 min)",
            session_date="2025-03-25",
            insurance_coverage=100.00,
            patient_responsibility=50.00,
            created_at="2025-03-25T12:00:00Z",
            updated_at="2025-03-25T12:00:00Z"
        ),
        Payment(
            id="pay2",
            patient_id="p2",
            patient_name="Robert Smith",
            therapist_id="doctor2",
            therapist_name="Dr. Michael Lee",
            amount=200.00,
            due_date="2025-04-10",
            status="upcoming",
            type="session",
            description="Initial Assessment (60 min)",
            session_date="2025-03-28",
            insurance_coverage=150.00,
            patient_responsibility=50.00,
            created_at="2025-03-28T14:30:00Z",
            updated_at="2025-03-28T14:30:00Z"
        ),
        Payment(
            id="pay3",
            patient_id="p1",
            patient_name="Alice Johnson",
            therapist_id="doctor1",
            therapist_name="Dr. Sarah Johnson",
            amount=150.00,
            due_date="2025-03-20",
            paid_date="2025-03-18",
            status="paid",
            type="session",
            description="Individual Therapy Session (45 min)",
            session_date="2025-03-15",
            payment_method="Credit Card",
            transaction_id="txn_12345",
            created_at="2025-03-15T10:15:00Z",
            updated_at="2025-03-18T09:30:00Z"
        )
    ]
    
    # Add to databases
    for method in methods:
        payment_methods_db[method.id] = method
    
    for payment in payments:
        payments_db[payment.id] = payment

# Initialize data
init_sample_data()

# Create router
router = APIRouter(
    prefix="/api/payments",
    tags=["payments"],
    responses={404: {"description": "Not found"}},
)

# Routes
@router.get("/", response_model=List[Payment])
async def get_payments(
    patient_id: Optional[str] = None,
    therapist_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get all payments, optionally filtered"""
    payments = list(payments_db.values())
    
    # Apply filters
    if patient_id:
        payments = [payment for payment in payments if payment.patient_id == patient_id]
    
    if therapist_id:
        payments = [payment for payment in payments if payment.therapist_id == therapist_id]
    
    if status:
        payments = [payment for payment in payments if payment.status == status]
    
    if start_date:
        payments = [payment for payment in payments if payment.due_date >= start_date]
    
    if end_date:
        payments = [payment for payment in payments if payment.due_date <= end_date]
    
    # Sort by due date
    payments.sort(key=lambda x: x.due_date, reverse=True)
    
    return payments

@router.get("/{payment_id}", response_model=Payment)
async def get_payment(payment_id: str):
    """Get a specific payment by ID"""
    if payment_id not in payments_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {payment_id} not found"
        )
    
    return payments_db[payment_id]

@router.post("/", response_model=Payment, status_code=status.HTTP_201_CREATED)
async def create_payment(payment: PaymentCreate):
    """Create a new payment"""
    # Create new payment with default fields
    due_date = datetime.fromisoformat(payment.due_date.replace('Z', '+00:00'))
    today = datetime.now()
    
    # Determine status based on due date
    status_value = "upcoming"
    if due_date < today:
        status_value = "overdue"
    
    new_payment = Payment(
        **payment.dict(),
        id=f"pay{len(payments_db) + 1}",
        status=status_value,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    
    # Add to database
    payments_db[new_payment.id] = new_payment
    
    return new_payment

@router.put("/{payment_id}", response_model=Payment)
async def update_payment(payment_id: str, updates: PaymentUpdate):
    """Update an existing payment"""
    if payment_id not in payments_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {payment_id} not found"
        )
    
    # Get existing payment
    payment = payments_db[payment_id]
    
    # Update fields
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(payment, key, value)
    
    # If paid_date is set, update status to paid
    if updates.paid_date:
        payment.status = "paid"
    
    # Update timestamp
    payment.updated_at = datetime.now().isoformat()
    
    return payment

@router.post("/process", response_model=Payment)
async def process_payment(request: ProcessPaymentRequest):
    """Process a payment"""
    # Check payment exists
    if request.payment_id not in payments_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {request.payment_id} not found"
        )
    
    # Check payment method exists
    if request.payment_method_id not in payment_methods_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment method with ID {request.payment_method_id} not found"
        )
    
    payment = payments_db[request.payment_id]
    payment_method = payment_methods_db[request.payment_method_id]
    
    # Ensure payment amount matches
    if payment.amount != request.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount {request.amount} does not match expected amount {payment.amount}"
        )
    
    # Process payment (in a real app, this would call a payment processor)
    now = datetime.now()
    
    # Update payment
    payment.paid_date = now.strftime("%Y-%m-%d")
    payment.status = "paid"
    payment.payment_method = payment_method.name
    payment.transaction_id = f"txn_{uuid.uuid4().hex[:8]}"
    payment.updated_at = now.isoformat()
    
    return payment

@router.get("/methods/{user_id}", response_model=List[PaymentMethod])
async def get_payment_methods(user_id: str):
    """Get all payment methods for a user"""
    methods = [method for method in payment_methods_db.values() if method.user_id == user_id]
    return methods

@router.post("/methods", response_model=PaymentMethod, status_code=status.HTTP_201_CREATED)
async def create_payment_method(method: PaymentMethodCreate):
    """Create a new payment method"""
    # Check if should be default
    make_default = method.is_default
    
    # Create new method
    new_method = PaymentMethod(
        **method.dict(),
        id=f"pm{len(payment_methods_db) + 1}",
        created_at=datetime.now().isoformat()
    )
    
    # If this is the default, update other methods
    if make_default:
        for existing_method in payment_methods_db.values():
            if existing_method.user_id == method.user_id:
                existing_method.is_default = False
    
    # Add to database
    payment_methods_db[new_method.id] = new_method
    
    return new_method

@router.delete("/methods/{method_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment_method(method_id: str):
    """Delete a payment method"""
    if method_id not in payment_methods_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment method with ID {method_id} not found"
        )
    
    # Get the method to check if it's a default
    method = payment_methods_db[method_id]
    was_default = method.is_default
    user_id = method.user_id
    
    # Delete the method
    del payment_methods_db[method_id]
    
    # If this was the default, set a new default if available
    if was_default:
        user_methods = [m for m in payment_methods_db.values() if m.user_id == user_id]
        if user_methods:
            user_methods[0].is_default = True
    
    return None