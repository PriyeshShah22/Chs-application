"""Admin router: user management, audit logs, system stats."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_any_role
from app.db.base import get_db
from app.models.audit import AuditLog
from app.models.bill import Bill, BillStatus
from app.models.complaint import Complaint, ComplaintStatus
from app.models.user import User, UserStatus
from app.models.user import Role
from app.models.join_request import JoinRequest, JoinRequestStatus
from app.core.security import hash_password
from app.schemas.join_request import JoinRequestOut
from app.schemas.user import RoleOut, UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/join-requests", response_model=List[JoinRequestOut])
def list_join_requests(db: Session = Depends(get_db), current=Depends(get_current_user)):
    require_any_role(current, ["admin"])
    rows = db.execute(select(JoinRequest).where(JoinRequest.status == JoinRequestStatus.pending)
                      .order_by(desc(JoinRequest.created_at))).scalars().all()
    return [JoinRequestOut.model_validate(row) for row in rows]


@router.post("/join-requests/{request_id}/approve", response_model=UserOut)
def approve_join_request(request_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)) -> UserOut:
    require_any_role(current, ["admin"])
    request = db.get(JoinRequest, request_id)
    if not request or request.status != JoinRequestStatus.pending:
        raise HTTPException(status_code=404, detail="Pending membership request not found")
    if db.execute(select(User).where(User.email == request.email)).scalar_one_or_none():
        raise HTTPException(status_code=409, detail="An account already exists for this email")
    resident_role = db.execute(select(Role).where(Role.name == "resident")).scalar_one_or_none()
    if not resident_role:
        resident_role = Role(name="resident", description="Resident / owner")
        db.add(resident_role)
        db.flush()
    user = User(
        email=request.email,
        phone=request.phone,
        full_name=request.full_name,
        hashed_password=request.hashed_password,
        society_id=request.society_id or current.society_id,
        status=UserStatus.active,
    )
    user.roles.append(resident_role)
    db.add(user)
    db.flush()
    request.status = JoinRequestStatus.approved
    request.reviewer_id = current.id
    request.reviewed_at = datetime.utcnow()
    db.add(AuditLog(actor_id=current.id, action="join_request_approved", entity_type="user", entity_id=user.id, details=f"request_id={request.id}"))
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.post("/join-requests/{request_id}/reject", response_model=JoinRequestOut)
def reject_join_request(request_id: int, db: Session = Depends(get_db), current=Depends(get_current_user)) -> JoinRequestOut:
    require_any_role(current, ["admin"])
    request = db.get(JoinRequest, request_id)
    if not request or request.status != JoinRequestStatus.pending:
        raise HTTPException(status_code=404, detail="Pending membership request not found")
    request.status = JoinRequestStatus.rejected
    request.reviewer_id = current.id
    request.reviewed_at = datetime.utcnow()
    db.add(AuditLog(actor_id=current.id, action="join_request_rejected", entity_type="join_request", entity_id=request.id))
    db.commit()
    db.refresh(request)
    return JoinRequestOut.model_validate(request)


@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db),
               current=Depends(get_current_user),
               search: Optional[str] = None,
               limit: int = Query(50, le=200)):
    require_any_role(current, ["admin", "committee"])
    q = select(User)
    if search:
        like = f"%{search}%"
        q = q.where((User.email.ilike(like)) | (User.full_name.ilike(like)))
    users = db.execute(q.limit(limit)).scalars().all()
    return [UserOut.model_validate(u) for u in users]


@router.get("/audit-logs")
def audit_logs(db: Session = Depends(get_db),
               current=Depends(get_current_user),
               limit: int = Query(100, le=500)):
    require_any_role(current, ["admin"])
    rows = db.execute(select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit)).scalars().all()
    return [
        {
            "id": r.id,
            "actor_id": r.actor_id,
            "action": r.action,
            "entity_type": r.entity_type,
            "entity_id": r.entity_id,
            "ip_address": r.ip_address,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "details": r.details,
        }
        for r in rows
    ]


@router.get("/stats")
def stats(db: Session = Depends(get_db), current=Depends(get_current_user)):
    require_any_role(current, ["admin", "committee"])
    users = db.execute(select(func.count(User.id))).scalar() or 0
    active_users = db.execute(select(func.count(User.id))
                              .where(User.status == UserStatus.active)).scalar() or 0
    complaints = db.execute(select(func.count(Complaint.id))).scalar() or 0
    open_complaints = db.execute(select(func.count(Complaint.id))
                                 .where(Complaint.status == ComplaintStatus.open)).scalar() or 0
    overdue = db.execute(select(func.count(Bill.id))
                         .where(Bill.status == BillStatus.overdue)).scalar() or 0
    outstanding = db.execute(
        select(func.coalesce(func.sum(Bill.total_amount - Bill.paid_amount), 0))
        .where(Bill.status.in_([BillStatus.pending, BillStatus.overdue]))
    ).scalar() or 0
    return {
        "users_total": users,
        "users_active": active_users,
        "complaints_total": complaints,
        "complaints_open": open_complaints,
        "bills_overdue": overdue,
        "outstanding_amount": round(float(outstanding), 2),
    }


@router.post("/users/{user_id}/roles/{role_name}", response_model=UserOut)
def add_role(user_id: int, role_name: str, db: Session = Depends(get_db),
             current=Depends(get_current_user)) -> UserOut:
    require_any_role(current, ["admin"])
    user = db.get(User, user_id)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    role = db.execute(select(Role).where(Role.name == role_name)).scalar_one_or_none()
    if not role:
        role = Role(name=role_name, description=f"Created by admin {current.id}")
        db.add(role)
        db.flush()
    if role not in user.roles:
        user.roles.append(role)
        db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)
