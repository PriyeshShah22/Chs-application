"""Idempotently align existing demo accounts with the documented credentials."""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import SessionLocal
from app.models.user import User


DEMO_CREDENTIALS = {
    "admin@society.com": "admin123",
    "committee@society.com": "committee123",
    "security@society.com": "security123",
    "resident@society.com": "resident123",
    "resident2@society.com": "resident123",
}


def main() -> None:
    db = SessionLocal()
    try:
        users = db.execute(select(User).where(User.email.in_(DEMO_CREDENTIALS))).scalars().all()
        found = {user.email for user in users}
        missing = set(DEMO_CREDENTIALS) - found
        if missing:
            raise RuntimeError(f"Missing demo accounts: {', '.join(sorted(missing))}")
        for user in users:
            user.hashed_password = hash_password(DEMO_CREDENTIALS[user.email])
        db.commit()
        print(f"Updated {len(users)} demo accounts.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
