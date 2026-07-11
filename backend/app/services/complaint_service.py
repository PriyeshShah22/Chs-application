"""Authoritative complaint operations shared by manual and assistant flows."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit import AuditLog
from app.models.complaint import Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus
from app.models.user import User
from app.schemas.complaint import ComplaintCreate


def classify_complaint(text: str) -> str:
    """Deterministic category suggestion; authoritative fields remain user-correctable."""
    text = text.lower()
    buckets = {
        "Plumbing": ["leak", "tap", "pipe", "water", "drain", "toilet", "sink"],
        "Electrical": ["light", "bulb", "power", "electric", "fuse", "switch", "fan"],
        "Cleaning": ["dirty", "garbage", "trash", "clean", "dust", "litter"],
        "Security": ["guard", "security", "theft", "camera", "cctv", "suspicious"],
        "Parking": ["park", "vehicle", "car", "bike"],
        "Lift": ["lift", "elevator"],
        "Pest Control": ["pest", "insect", "cockroach", "rat", "mosquito"],
        "Noise": ["noise", "loud", "music", "party"],
    }
    best, hits = "General", 0
    for category, words in buckets.items():
        score = sum(1 for word in words if word in text)
        if score > hits:
            best, hits = category, score
    return best


def create_complaint(db: Session, actor: User, payload: ComplaintCreate, *, source: str = "manual") -> Complaint:
    try:
        priority = ComplaintPriority(payload.priority)
    except ValueError as exc:
        raise ValueError(f"Invalid priority '{payload.priority}'") from exc

    category_id = payload.category_id
    suggested = None
    if category_id is None:
        suggested = classify_complaint(f"{payload.title} {payload.description}")
        category = db.execute(
            select(ComplaintCategory).where(ComplaintCategory.name == suggested)
        ).scalar_one_or_none()
        category_id = category.id if category else None

    complaint = Complaint(
        title=payload.title,
        description=payload.description,
        society_id=payload.society_id,
        flat_id=payload.flat_id,
        reporter_id=actor.id,
        category_id=category_id,
        priority=priority,
        status=ComplaintStatus.open,
        photo_url=payload.photo_url,
        ai_suggested_category=suggested,
    )
    db.add(complaint)
    db.flush()
    db.add(AuditLog(
        actor_id=actor.id,
        action="complaint_create",
        entity_type="complaint",
        entity_id=complaint.id,
        details=f"source={source}",
    ))
    db.commit()
    db.refresh(complaint)
    return complaint
