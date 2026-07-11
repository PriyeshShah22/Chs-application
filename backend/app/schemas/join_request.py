from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class JoinRequestCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=20)
    date_of_birth: date
    password: str = Field(min_length=8, max_length=128)
    society_id: Optional[int] = None


class JoinRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: date
    society_id: Optional[int] = None
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
