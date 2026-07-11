"""Persisted, risk-aware actions proposed by the Panchayat Assistant."""
from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AIActionRisk(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class AIActionStatus(str, enum.Enum):
    draft = "draft"
    needs_information = "needs_information"
    awaiting_confirmation = "awaiting_confirmation"
    executing = "executing"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"
    expired = "expired"


class AIAction(Base):
    __tablename__ = "ai_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    requester_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    risk: Mapped[AIActionRisk] = mapped_column(Enum(AIActionRisk), nullable=False)
    status: Mapped[AIActionStatus] = mapped_column(Enum(AIActionStatus), nullable=False, index=True)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    result_entity_type: Mapped[Optional[str]] = mapped_column(String(50))
    result_entity_id: Mapped[Optional[int]] = mapped_column(Integer)
    failure_code: Mapped[Optional[str]] = mapped_column(String(80))
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
