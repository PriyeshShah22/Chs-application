"""AI assistant endpoint."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.schemas.chat import ActionResult, ChatRequest, ChatResponse
from app.services.ai_service import cancel_action, chat as ai_chat, confirm_action

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest,
         db: Session = Depends(get_db),
         current: User = Depends(get_current_user)) -> ChatResponse:
    result = ai_chat(db, current, payload.message)
    return ChatResponse(**result)


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
