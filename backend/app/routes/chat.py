from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.ai import call_ai
from app.auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])


class MessageIn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[MessageIn]


class ChatResponse(BaseModel):
    message: str
    fields: dict


@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest, _user: dict = Depends(get_current_user)) -> ChatResponse:
    """Send conversation history to AI, receive reply and extracted NDA fields."""
    messages = [{"role": m.role, "content": m.content} for m in body.messages]
    result = await call_ai(messages)
    return ChatResponse(message=result["message"], fields=result.get("fields") or {})
