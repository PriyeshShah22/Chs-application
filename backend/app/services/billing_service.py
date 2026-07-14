"""Authoritative bill generation and ledger operations."""
from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.bill import Bill, BillLineItem, BillStatus, Payment
from app.models.user import User


class MonthlyBillingConflict(ValueError):
    """Raised when a society period has already been published."""

def _next_bill_number(db: Session, society_id: int, year: int) -> str:
    prefix = f"BILL-{society_id}-{year}-"
    last = db.execute(select(Bill).where(Bill.bill_number.like(f"{prefix}%")).order_by(Bill.id.desc()).limit(1)).scalars().first()
    sequence = 1
    if last:
        try: sequence = int(last.bill_number.rsplit("-", 1)[1]) + 1
        except ValueError: sequence = last.id + 1
    return f"{prefix}{sequence:04d}"


def create_user_bill(db: Session, *, society_id: int, billed_user: User, billing_year: int,
                     billing_month: int, due_date: date, maintenance_amount: float,
                     description: str | None = None, commit: bool = True) -> Bill:
    if billed_user.society_id != society_id or "resident" not in billed_user.role_names:
        raise ValueError("Bills can only be created for resident accounts in this society")
    if billing_month < 1 or billing_month > 12: raise ValueError("Invalid billing month")
    existing = db.execute(select(Bill).where(Bill.billed_user_id == billed_user.id,
        Bill.billing_year == billing_year, Bill.billing_month == billing_month)).scalar_one_or_none()
    if existing: raise ValueError("This resident already has a bill for that month")
    total = round(float(maintenance_amount), 2)
    if total <= 0: raise ValueError("Bill total must be greater than zero")
    resident = billed_user.resident
    if not resident: raise ValueError("Resident does not have a household/flat mapping")
    period = date(billing_year, billing_month, 1).strftime("%B %Y")
    bill = Bill(society_id=society_id, flat_id=resident.flat_id, resident_id=resident.id,
        billed_user_id=billed_user.id, billing_year=billing_year, billing_month=billing_month,
        bill_number=_next_bill_number(db, society_id, billing_year), title=f"Maintenance {period}",
        description=description or f"Monthly society charges for {period}", amount=total,
        late_fee=0, total_amount=total, paid_amount=0, status=BillStatus.pending,
        issue_date=date.today(), due_date=due_date)
    db.add(bill); db.flush()
    db.add(BillLineItem(bill_id=bill.id, code="maintenance", label="Monthly Maintenance", amount=total))
    if commit:
        db.commit(); db.refresh(bill)
    return bill


def create_society_monthly_bills(db: Session, *, society_id: int, billing_year: int,
                                 billing_month: int, due_date: date,
                                 maintenance_amount: float) -> tuple[int, int]:
    if billing_month < 1 or billing_month > 12:
        raise ValueError("Invalid billing month")
    if maintenance_amount <= 0:
        raise ValueError("Maintenance amount must be greater than zero")
    existing = db.execute(select(Bill.id).where(
        Bill.society_id == society_id,
        Bill.billing_year == billing_year,
        Bill.billing_month == billing_month,
    ).limit(1)).scalar_one_or_none()
    if existing:
        period = date(billing_year, billing_month, 1).strftime("%B %Y")
        raise MonthlyBillingConflict(f"Maintenance for {period} has already been published")
    residents = db.execute(select(User).where(User.society_id == society_id)).scalars().all()
    eligible = [user for user in residents if "resident" in user.role_names and user.resident]
    if not eligible:
        raise ValueError("No approved residents with linked flats are available to bill")
    created = 0
    for user in eligible:
        create_user_bill(db, society_id=society_id, billed_user=user,
                         billing_year=billing_year, billing_month=billing_month,
                         due_date=due_date, maintenance_amount=maintenance_amount,
                         commit=False)
        created += 1
    db.commit()
    return created, 0


def apply_late_fees_and_overdue(db: Session, society_id: int | None = None) -> int:
    today = date.today(); query = select(Bill).where(Bill.status == BillStatus.pending, Bill.due_date < today)
    if society_id is not None: query = query.where(Bill.society_id == society_id)
    bills = db.execute(query).scalars().all()
    for bill in bills: bill.status = BillStatus.overdue
    db.commit(); return len(bills)


def record_payment(db: Session, bill: Bill, amount: float, method: str,
                   transaction_ref: str | None = None, received_by: int | None = None,
                   notes: str | None = None) -> Payment:
    amount = round(float(amount), 2)
    if amount <= 0 or amount > bill.outstanding: raise ValueError("Payment must be positive and cannot exceed the outstanding amount")
    payment = Payment(bill_id=bill.id, amount=amount, method=method,
        transaction_ref=transaction_ref, received_by=received_by, notes=notes)
    db.add(payment); bill.paid_amount = round(bill.paid_amount + amount, 2); bill.paid_at = datetime.utcnow()
    bill.status = BillStatus.paid if bill.outstanding <= 0 else BillStatus.partial
    db.commit(); db.refresh(payment); return payment
