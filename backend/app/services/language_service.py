"""Small, offline language detector for assistant text and output."""
from __future__ import annotations

import re

from langdetect import DetectorFactory, LangDetectException, detect

DetectorFactory.seed = 0
MARATHI_MARKERS = {"आहे", "आहेत", "नाही", "मला", "माझी", "माझ्या", "तुमची", "तुम्ही", "सांगा", "करा", "नोंदवा", "आजच्या", "काय", "aahe", "nahi", "mala", "majhi", "majhya", "tumchi", "sanga", "kara", "nondva"}
HINDI_MARKERS = {"है", "हैं", "नहीं", "मुझे", "मेरी", "बताइए", "करें", "करना", "आज", "hai", "nahi", "mujhe", "meri", "batao", "karo", "karna"}


def detect_language_code(text: str, fallback: str = "en-IN") -> str:
    """Return a BCP-47 code without calling an external service."""
    cleaned = (text or "").strip()
    if not cleaned:
        return fallback
    tokens = set(re.findall(r"[\w\u0900-\u097f]+", cleaned.lower()))
    marathi_score = len(tokens & MARATHI_MARKERS) + (2 if "ळ" in cleaned else 0)
    hindi_score = len(tokens & HINDI_MARKERS)
    if marathi_score > hindi_score:
        return "mr-IN"
    if hindi_score > marathi_score:
        return "hi-IN"
    try:
        return {"en": "en-IN", "hi": "hi-IN", "mr": "mr-IN"}.get(detect(cleaned), fallback)
    except LangDetectException:
        return fallback
