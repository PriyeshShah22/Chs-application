"""Pending membership applications reviewed by a society administrator."""
from __future__ import annotations

import enum
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class JoinRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class JoinRequest(Base):
    __tablename__ = "join_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    society_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("societies.id", ondelete="SET NULL"), index=True)
    status: Mapped[JoinRequestStatus] = mapped_column(Enum(JoinRequestStatus), default=JoinRequestStatus.pending, nullable=False, index=True)
    reviewer_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
