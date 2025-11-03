from fastapi import APIRouter, Depends
from schemas.ai_chat import AIChatCreate, AIChatOut, AIChatUpdate
from schemas.message import Message
from core.db import get_db
from uuid import UUID

from services.ai_chat import (
    create_ai_chat,
    delete_ai_chat,
    get_ai_chat,
    update_ai_chat,
    get_ai_chat_by_progress
)

router = APIRouter(prefix='/ai_chat', tags=['AI Chat'])

@router.post('/', response_model=AIChatOut)
def r_create_ai_chat(ai_chat_create: AIChatCreate, db = Depends(get_db)) -> AIChatOut:
    return create_ai_chat(ai_chat_create, db=db)

@router.get('/{uuid}', response_model=AIChatOut)
def r_get_ai_chat(uuid: UUID, db = Depends(get_db)) -> AIChatOut:
    return get_ai_chat(uuid, db=db)

@router.put('/{uuid}', response_model=AIChatOut)
def r_update_ai_chat(uuid: UUID, ai_chat_update: AIChatUpdate, db = Depends(get_db)) -> AIChatOut:
    return update_ai_chat(uuid, ai_chat_update=ai_chat_update, db=db)

@router.delete('/{uuid}', response_model=Message)
def r_delete_ai_chat(uuid: UUID, db = Depends(get_db)) -> Message:
    return delete_ai_chat(uuid, db=db)

@router.get('/list/{progress_uuid}', response_model=list[AIChatOut])
def r_get_ai_chat_by_progress(uuid: UUID, db = Depends(get_db)) -> list[AIChatOut]:
    return get_ai_chat_by_progress(uuid, db=db)