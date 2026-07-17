"""Generate and persist complaint copy once so UI language switching stays instant."""
from __future__ import annotations

import json
from typing import Dict

from openai import OpenAI

from app.core.config import settings


TRANSLATION_KEYS = (
    "title_en",
    "description_en",
    "title_hi",
    "description_hi",
    "title_mr",
    "description_mr",
)


def _parse_translation(text: str) -> Dict[str, str]:
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return {}
    try:
        data = json.loads(text[start:end + 1])
    except (TypeError, json.JSONDecodeError):
        return {}
    if not all(isinstance(data.get(key), str) and data[key].strip() for key in TRANSLATION_KEYS):
        return {}
    return {key: data[key].strip() for key in TRANSLATION_KEYS}


def translate_complaint_copy(title: str, description: str) -> Dict[str, str]:
    """Return natural canonical English, Hindi, and Marathi copy; fail open on provider errors."""
    if not settings.OPENAI_API_KEY or settings.AI_PROVIDER != "openai":
        return {}
    try:
        response = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=25.0, max_retries=1).responses.create(
            model=settings.OPENAI_MODEL,
            instructions=(
                "Translate one housing-society complaint into natural formal English, Hindi, and Marathi. "
                "Preserve every fact, urgency, person name, wing/flat code, number, and date. Do not add facts. "
                "Never leave ordinary English words inside Hindi or Marathi; proper names and codes may remain. "
                "Return only one JSON object with exactly these string keys: title_en, description_en, "
                "title_hi, description_hi, title_mr, description_mr."
            ),
            input=json.dumps({"title": title, "description": description}, ensure_ascii=False),
            reasoning={"effort": "low"},
        )
        return _parse_translation(response.output_text)
    except Exception:
        return {}
