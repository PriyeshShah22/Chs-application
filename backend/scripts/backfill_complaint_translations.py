"""Backfill natural complaint translations without changing workflow state."""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select

from app.db.base import SessionLocal
from app.models.complaint import Complaint
from app.services.complaint_translation_service import translate_complaint_copy


def main() -> None:
    db = SessionLocal()
    updated = 0
    try:
        complaints = db.execute(select(Complaint)).scalars().all()
        for complaint in complaints:
            translated = translate_complaint_copy(complaint.title, complaint.description)
            if not translated:
                continue
            complaint.title = translated["title_en"]
            complaint.description = translated["description_en"]
            complaint.title_hi = translated["title_hi"]
            complaint.description_hi = translated["description_hi"]
            complaint.title_mr = translated["title_mr"]
            complaint.description_mr = translated["description_mr"]
            updated += 1
        db.commit()
        print(f"Updated {updated} complaint translations.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
