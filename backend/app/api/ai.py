"""AI assistant endpoint."""
import json
from openai import OpenAI
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from openai import APIConnectionError, APIStatusError, RateLimitError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.schemas.chat import ActionResult, ChatRequest, ChatResponse
from app.services.ai_service import cancel_action, chat as ai_chat, confirm_action
from app.services.sarvam_service import SarvamUnavailable, translate_audio
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/translate-ui")
def translate_ui(payload: dict, current: User = Depends(get_current_user)) -> dict:
    language = str(payload.get("language", "en"))
    texts = [str(text).strip()[:500] for text in payload.get("texts", []) if str(text).strip()][:200]
    if language == "en" or not texts:
        return {"translations": texts}
    if language not in {"hi", "mr"}:
        raise HTTPException(status_code=400, detail="Unsupported site language")
    target = "natural, simple Hindi in Devanagari" if language == "hi" else "natural, simple Marathi in Devanagari"
    client = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=25.0, max_retries=1)
    response = client.responses.create(
        model=settings.OPENAI_MODEL,
        instructions=f"Translate each UI string into {target}. Keep names, email addresses, IDs, dates, currency values, and numbers unchanged. Preserve the input order. Return only the JSON object required by the schema.",
        input=json.dumps(texts, ensure_ascii=False),
        reasoning={"effort": "low"},
        text={"format": {"type": "json_schema", "name": "ui_translations", "strict": True, "schema": {
            "type": "object", "properties": {"translations": {"type": "array", "items": {"type": "string"}}},
            "required": ["translations"], "additionalProperties": False,
        }}},
    )
    result = json.loads(response.output_text)
    translations = result.get("translations", [])
    if len(translations) != len(texts):
        raise HTTPException(status_code=502, detail="Translation response was incomplete")
    return {"translations": translations}


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest,
         db: Session = Depends(get_db),
         current: User = Depends(get_current_user)) -> ChatResponse:
    try:
        result = ai_chat(db, current, payload.message, payload.language, payload.history, payload.conversation_summary)
        return ChatResponse(**result)
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail="The AI service is busy. Please try again shortly.") from exc
    except (APIConnectionError, APIStatusError) as exc:
        raise HTTPException(status_code=503, detail="The AI service is temporarily unavailable. Manual services still work.") from exc


@router.post("/voice", response_model=ChatResponse)
async def voice(
    audio: UploadFile = File(...),
    language: str = Form("unknown"),
    history: str = Form("[]"),
    conversation_summary: str = Form(""),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> ChatResponse:
    content_type = (audio.content_type or "application/octet-stream").lower()
    raw = await audio.read()
    try:
        translated = translate_audio(raw, audio.filename or "recording.webm", content_type, language)
        try:
            parsed_history = json.loads(history)
        except json.JSONDecodeError as exc:
            raise ValueError("Invalid conversation history.") from exc
        result = ai_chat(db, current, translated["transcript"], translated["language_code"], parsed_history, conversation_summary or None)
        result["input_transcript"] = translated["transcript"]
        result["detected_language"] = translated["language_code"]
        return ChatResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except SarvamUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail="The AI service is busy. Please try again shortly.") from exc
    except (APIConnectionError, APIStatusError) as exc:
        raise HTTPException(status_code=503, detail="The AI service is temporarily unavailable. Manual services still work.") from exc


@router.post("/actions/{action_id}/confirm", response_model=ActionResult)
def confirm(action_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    try:
        return ActionResult(**confirm_action(db, current, action_id))
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except TimeoutError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.post("/actions/{action_id}/cancel", response_model=ActionResult)
def cancel(action_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    try:
        return ActionResult(**cancel_action(db, current, action_id))
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
