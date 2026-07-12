"""Bill and Payment schemas."""
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class BillCreate(BaseModel):
    billing_year: int
    billing_month: int
    maintenance_amount: float
    due_date: date


class MonthlyBillingResult(BaseModel):
    created: int
    skipped: int
    total_amount: float
    billing_year: int
    billing_month: int


class BillLineItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    label: str
    amount: float


class BilledUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str


class BillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    society_id: int
    flat_id: int
    resident_id: Optional[int] = None
    billed_user_id: Optional[int] = None
    billing_year: Optional[int] = None
    billing_month: Optional[int] = None
    bill_number: str
    title: str
    description: Optional[str] = None
    amount: float
    late_fee: float
    total_amount: float
    paid_amount: float
    status: str
    issue_date: date
    due_date: date
    paid_at: Optional[datetime] = None
    created_at: datetime
    line_items: List[BillLineItemOut] = []
    billed_user: Optional[BilledUserOut] = None


class PaymentCreate(BaseModel):
    amount: float
    method: str = "upi"
    transaction_ref: Optional[str] = None
    notes: Optional[str] = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    bill_id: int
    amount: float
    method: str
    transaction_ref: Optional[str] = None
    received_by: Optional[int] = None
    paid_at: datetime
    notes: Optional[str] = None


class PaymentOrderOut(BaseModel):
    attempt_id: int
    order_id: str
    amount_paise: int
    currency: str = "INR"
    key_id: str
    bill_number: str
    resident_name: str


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class DuesSummaryOut(BaseModel):
    bill_count: int
    total_outstanding: float
    oldest_due_date: Optional[date] = None
    bill_ids: List[int] = []
    demo_enabled: bool
