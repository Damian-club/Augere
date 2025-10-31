from fastapi import APIRouter, Depends
from schemas.ai_chat import AIChatCreate, AIChatOut, AIChatUpdate
from schemas.message import Message
from core.db import get_db
from uuid import UUID
from typing import List

from services.ai_chat import create_ai_chat as s_create_ai_chat
from services.ai_chat import delete_ai_chat as s_delete_ai_chat
from services.ai_chat import get_ai_chat as s_get_ai_chat
from services.ai_chat import update_ai_chat as s_update_ai_chat
from services.ai_chat import get_ai_chat_by_progress as s_get_ai_chat_by_progress

router = APIRouter(prefix='/ai_chat', tags=['AI Chat'])

@router.post('/', response_model=AIChatOut)
def create_ai_chat(data: AIChatCreate, db = Depends(get_db)):
    return s_create_ai_chat(data, db)

@router.get('/{uuid}', response_model=AIChatOut)
def get_ai_chat(uuid: UUID, db = Depends(get_db)):
    return s_get_ai_chat(uuid, db)

@router.put('/', response_model=AIChatOut)
def update_ai_chat(data: AIChatUpdate, db = Depends(get_db)):
    return s_update_ai_chat(data, db)

@router.delete('/{uuid}', response_model=Message)
def delete_ai_chat(uuid: UUID, db = Depends(get_db)):
    return s_delete_ai_chat(uuid, db)

@router.get('/list/{progress_uuid}', response_model=List[AIChatOut])
def get_ai_chat_by_progress(uuid: UUID, db = Depends(get_db)):
    return s_get_ai_chat_by_progress(uuid, db)