"""AI assistant service.

Uses OpenAI when configured, otherwise falls back to a deterministic local
intent router over real database facts. Always permission-aware: residents
only see their own data; committee/admin see their scope.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.bill import Bill, BillStatus
from app.models.ai_action import AIAction, AIActionRisk, AIActionStatus
from app.models.audit import AuditLog
from app.models.chat import ChatMessage
from app.models.complaint import Complaint, ComplaintStatus
from app.models.notice import Notice
from app.models.resident import Resident
from app.models.user import User
from app.models.visitor import Visitor, VisitorStatus
from app.schemas.complaint import ComplaintCreate
from app.services.complaint_service import classify_complaint, create_complaint


_INTENTS = {
    "create_complaint": [r"no water", r"not working", r"broken", r"leak", r"garbage", r"streetlight", r"complain", r"report (?:an? )?issue"],
    "maintenance_pending": [r"\bmaintenance\b", r"outstanding", r"unpaid", r"due bill"],
    "complaint_history": [r"complaint", r"issue", r"ticket"],
    "last_payment": [r"last payment", r"recent payment", r"paid"],
    "visitors_today": [r"visitor", r"guest", r"who came", r"who visited"],
    "notices_recent": [r"notice", r"announcement", r"circular"],
    "defaulter_list": [r"defaulter", r"who hasn.?t paid", r"outstanding list"],
    "active_users": [r"active user", r"inactive"],
    "summary": [r"summari[sz]e", r"overview", r"report"],
}


def _classify(message: str) -> str:
    msg = message.lower()
    for intent, patterns in _INTENTS.items():
        for p in patterns:
            if re.search(p, msg):
                return intent
    return "generic"


def _resident_flat_ids(db: Session, resident: Resident) -> List[int]:
    return [resident.flat_id]


def _handle_intent(intent: str, db: Session, user: User) -> Dict[str, Any]:
    data: Dict[str, Any] = {}

    if intent == "maintenance_pending":
        if user.is_superuser or "committee" in user.role_names or "admin" in user.role_names:
            bills = db.execute(
                select(Bill).where(Bill.status.in_([BillStatus.pending, BillStatus.overdue])).limit(20)
            ).scalars().all()
            data["outstanding_count"] = len(bills)
            data["total_outstanding"] = round(sum(b.outstanding for b in bills), 2)
            data["sample"] = [
                {"bill_number": b.bill_number, "flat_id": b.flat_id, "outstanding": b.outstanding}
                for b in bills[:5]
            ]
        else:
            resident = user.resident
            if not resident:
                return {"reply": "I could not find your resident profile."}
            bills = db.execute(
                select(Bill).where(
                    Bill.flat_id == resident.flat_id,
                    Bill.status.in_([BillStatus.pending, BillStatus.overdue]),
                )
            ).scalars().all()
            data["outstanding_count"] = len(bills)
            data["total_outstanding"] = round(sum(b.outstanding for b in bills), 2)

    elif intent == "complaint_history":
        if user.is_superuser or "committee" in user.role_names or "admin" in user.role_names:
            recent = db.execute(
                select(Complaint).order_by(desc(Complaint.created_at)).limit(10)
            ).scalars().all()
        else:
            recent = db.execute(
                select(Complaint).where(Complaint.reporter_id == user.id)
                .order_by(desc(Complaint.created_at)).limit(10)
            ).scalars().all()
        data["count"] = len(recent)
        data["recent"] = [
            {"id": c.id, "title": c.title, "status": c.status.value, "priority": c.priority.value}
            for c in recent
        ]

    elif intent == "last_payment":
        if not user.resident:
            return {"reply": "Resident profile not found."}
        bills = db.execute(
            select(Bill).where(Bill.flat_id == user.resident.flat_id, Bill.paid_at.is_not(None))
            .order_by(desc(Bill.paid_at)).limit(1)
        ).scalars().first()
        if bills:
            data["amount"] = bills.paid_amount
            data["paid_at"] = bills.paid_at.isoformat()
            data["bill_number"] = bills.bill_number
        else:
            data["paid_at"] = None

    elif intent == "visitors_today":
        since = datetime.utcnow() - timedelta(hours=24)
        if user.is_superuser or "security" in user.role_names or "committee" in user.role_names:
            visitors = db.execute(
                select(Visitor).where(Visitor.created_at >= since)
            ).scalars().all()
        else:
            visitors = db.execute(
                select(Visitor).where(Visitor.host_id == user.id, Visitor.created_at >= since)
            ).scalars().all()
        data["count"] = len(visitors)
        data["sample"] = [
            {"name": v.name, "purpose": v.purpose, "status": v.status.value} for v in visitors[:5]
        ]

    elif intent == "notices_recent":
        notices = db.execute(
            select(Notice).order_by(desc(Notice.published_at)).limit(5)
        ).scalars().all()
        data["count"] = len(notices)
        data["recent"] = [{"id": n.id, "title": n.title} for n in notices]

    elif intent == "defaulter_list":
        rows = db.execute(
            select(Bill.flat_id, func.count(Bill.id).label("cnt"), func.sum(Bill.total_amount - Bill.paid_amount).label("due"))
            .where(Bill.status.in_([BillStatus.pending, BillStatus.overdue]))
            .group_by(Bill.flat_id).order_by(desc("due")).limit(10)
        ).all()
        data["top_defaulters"] = [
            {"flat_id": r.flat_id, "bills": r.cnt, "outstanding": round(float(r.due or 0), 2)} for r in rows
        ]

    elif intent == "active_users":
        rows = db.execute(select(User).limit(20)).scalars().all()
        data["active_count"] = sum(1 for u in rows if u.status.value == "active")
        data["sample"] = [u.email for u in rows[:5]]

    elif intent == "summary":
        complaints = db.execute(select(func.count(Complaint.id))).scalar() or 0
        bills = db.execute(select(func.count(Bill.id))).scalar() or 0
        visitors = db.execute(select(func.count(Visitor.id))).scalar() or 0
        data = {"complaints_total": complaints, "bills_total": bills, "visitors_total": visitors}

    return data


def _complaint_proposal(db: Session, user: User, message: str) -> Dict[str, Any]:
    resident = user.resident
    if not user.society_id or not resident:
        return {
            "intent": "create_complaint",
            "reply": "I need a linked household before I can submit this. You can use the manual form or ask a Panchayat volunteer for help.",
            "data": {"needs": ["household"]},
            "available_actions": ["open_manual_complaint", "request_human_help"],
        }

    category = classify_complaint(message)
    title = {
        "Plumbing": "Water or plumbing problem",
        "Electrical": "Electricity or streetlight problem",
        "Cleaning": "Cleaning or garbage problem",
        "Security": "Security concern",
    }.get(category, "Community service problem")
    payload = {
        "title": title,
        "description": message.strip(),
        "society_id": user.society_id,
        "flat_id": resident.flat_id,
        "priority": "high" if any(w in message.lower() for w in ("danger", "urgent", "flood", "fire")) else "medium",
    }
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    summary = f"Submit a {category.lower()} complaint for your household: {message.strip()}"
    action = AIAction(
        requester_id=user.id,
        action_type="create_complaint",
        risk=AIActionRisk.medium,
        status=AIActionStatus.awaiting_confirmation,
        payload_json=json.dumps(payload),
        summary=summary,
        expires_at=expires_at,
    )
    db.add(action)
    db.flush()
    db.add(AuditLog(
        actor_id=user.id,
        action="ai_action_proposed",
        entity_type="ai_action",
        entity_id=action.id,
        details="type=create_complaint;risk=medium",
    ))
    db.commit()
    db.refresh(action)
    return {
        "intent": "create_complaint",
        "reply": "I understood this as a complaint. Please check the details below. I will submit it only after you confirm.",
        "data": {"suggested_category": category},
        "action": {
            "id": action.id,
            "action_type": action.action_type,
            "risk": action.risk.value,
            "status": action.status.value,
            "summary": action.summary,
            "fields": payload,
            "expires_at": action.expires_at,
        },
        "available_actions": ["confirm", "cancel", "open_manual_complaint", "request_human_help"],
    }


def _natural_reply(intent: str, data: Dict[str, Any], user: User) -> str:
    role = "Admin" if user.is_superuser else next(iter(user.role_names), "User")

    if intent == "maintenance_pending":
        if "outstanding_count" not in data:
            return "I could not retrieve your maintenance status."
        return (
            f"You have {data['outstanding_count']} outstanding bill(s) totalling "
            f"₹{data['total_outstanding']}."
        )
    if intent == "complaint_history":
        return f"You have filed {data.get('count', 0)} complaint(s). Most recent: " + ", ".join(
            f"#{c['id']} {c['title']} ({c['status']})" for c in data.get("recent", [])[:3]
        )
    if intent == "last_payment":
        if not data.get("paid_at"):
            return "No payments recorded yet."
        return f"Your last payment was ₹{data['amount']} on {data['paid_at']} for bill {data['bill_number']}."
    if intent == "visitors_today":
        names = ", ".join(v["name"] for v in data.get("sample", []))
        return f"{data['count']} visitor(s) in the last 24 hours. Latest: {names or 'none'}."
    if intent == "notices_recent":
        titles = "; ".join(n["title"] for n in data.get("recent", []))
        return f"{data['count']} recent notice(s): {titles or 'none'}."
    if intent == "defaulter_list":
        items = data.get("top_defaulters", [])
        if not items:
            return "No defaulters right now."
        return "Top defaulters by outstanding amount: " + ", ".join(
            f"Flat {d['flat_id']} (₹{d['outstanding']})" for d in items
        )
    if intent == "active_users":
        return f"Active accounts in the directory: {data['active_count']}."
    if intent == "summary":
        return (
            f"Society snapshot ({role} view): {data['complaints_total']} complaints, "
            f"{data['bills_total']} bills, {data['visitors_total']} visitors on record."
        )
    return "I can help with maintenance, complaints, visitors, notices, and reports. Try asking: 'Show my pending maintenance'."


def chat(db: Session, user: User, message: str) -> Dict[str, Any]:
    """Main entry-point: classify, fetch permission-aware data, reply."""
    intent = _classify(message)
    if intent == "create_complaint":
        result = _complaint_proposal(db, user, message)
        reply = result["reply"]
        db.add(ChatMessage(user_id=user.id, role="user", content=message, intent=intent))
        db.add(ChatMessage(user_id=user.id, role="assistant", content=reply, intent=intent))
        db.commit()
        return result
    data = _handle_intent(intent, db, user)
    reply = _natural_reply(intent, data, user)

    # persist both turns
    db.add(ChatMessage(user_id=user.id, role="user", content=message, intent=intent))
    db.add(ChatMessage(user_id=user.id, role="assistant", content=reply, intent=intent))
    db.commit()

    return {"intent": intent, "reply": reply, "data": data, "available_actions": ["request_human_help"]}


def confirm_action(db: Session, user: User, action_id: int) -> Dict[str, Any]:
    action = db.get(AIAction, action_id)
    if not action:
        raise LookupError("Action not found")
    if action.requester_id != user.id:
        raise PermissionError("This action belongs to another user")
    if action.status != AIActionStatus.awaiting_confirmation:
        raise ValueError(f"Action cannot be confirmed from state '{action.status.value}'")
    if action.expires_at <= datetime.utcnow():
        action.status = AIActionStatus.expired
        db.commit()
        raise TimeoutError("This action expired. Please ask the assistant again.")

    action.status = AIActionStatus.executing
    action.confirmed_at = datetime.utcnow()
    db.flush()
    try:
        if action.action_type != "create_complaint":
            raise ValueError("Unsupported action type")
        complaint = create_complaint(
            db, user, ComplaintCreate(**json.loads(action.payload_json)), source="assistant"
        )
        action = db.get(AIAction, action_id)
        action.status = AIActionStatus.completed
        action.result_entity_type = "complaint"
        action.result_entity_id = complaint.id
        db.add(AuditLog(
            actor_id=user.id,
            action="ai_action_completed",
            entity_type="ai_action",
            entity_id=action.id,
            details=f"complaint_id={complaint.id}",
        ))
        db.commit()
        return {
            "action_id": action.id,
            "status": action.status.value,
            "message": f"Complaint #{complaint.id} was submitted. You can track it in Complaints.",
            "entity_type": "complaint",
            "entity_id": complaint.id,
        }
    except Exception:
        db.rollback()
        action = db.get(AIAction, action_id)
        if action:
            action.status = AIActionStatus.failed
            action.failure_code = "PROCESSING_FAILED"
            db.commit()
        raise


def cancel_action(db: Session, user: User, action_id: int) -> Dict[str, Any]:
    action = db.get(AIAction, action_id)
    if not action:
        raise LookupError("Action not found")
    if action.requester_id != user.id:
        raise PermissionError("This action belongs to another user")
    if action.status != AIActionStatus.awaiting_confirmation:
        raise ValueError("Only a pending action can be cancelled")
    action.status = AIActionStatus.cancelled
    db.add(AuditLog(actor_id=user.id, action="ai_action_cancelled", entity_type="ai_action", entity_id=action.id))
    db.commit()
    return {"action_id": action.id, "status": "cancelled", "message": "The action was cancelled."}
