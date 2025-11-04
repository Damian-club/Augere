from fastapi import APIRouter, Depends
from core.db import get_db
from dependencies.ai_client import get_ai_client
from util.ai_agent import AIAgent
from sqlalchemy.orm import Session
from uuid import UUID

# SCHEMAS --------------------------
from schemas.ai_chat import (
    AIChatCreate,
    AIChatOut,
    AIChatUpdate,
    AIChatCreateSimple,
    AIPromptOut
)
from schemas.message import Message
from schemas.ai_util import Prompt
#-----------------------------------

# SERVICES -------------------------
from services.ai_chat import (
    create_ai_chat,
    delete_ai_chat,
    get_ai_chat,
    update_ai_chat,
    get_ai_chat_by_progress,
    create_ai_chat_simple,
    prompt_schema_by_course
)
#-----------------------------------

router = APIRouter(prefix='/ai_chat', tags=['AI Chat'])

@router.post('/', response_model=AIChatOut)
def r_create_ai_chat(ai_chat_create: AIChatCreate, db: Session = Depends(get_db)) -> AIChatOut:
    return create_ai_chat(ai_chat_create, db=db)

@router.get('/{uuid}', response_model=AIChatOut)
def r_get_ai_chat(uuid: UUID, db: Session = Depends(get_db)) -> AIChatOut:
    return get_ai_chat(uuid, db=db)

@router.put('/{uuid}', response_model=AIChatOut)
def r_update_ai_chat(uuid: UUID, ai_chat_update: AIChatUpdate, db: Session = Depends(get_db)) -> AIChatOut:
    return update_ai_chat(uuid, ai_chat_update=ai_chat_update, db=db)

@router.delete('/{uuid}', response_model=Message)
def r_delete_ai_chat(uuid: UUID, db: Session = Depends(get_db)) -> Message:
    return delete_ai_chat(uuid, db=db)

@router.get('/progress/{progress_uuid}', response_model=list[AIChatOut])
def r_get_ai_chat_by_progress(progress_uuid: UUID, db: Session = Depends(get_db)) -> list[AIChatOut]:
    return get_ai_chat_by_progress(progress_uuid, db=db)

@router.post('/progress/{progress_uuid}', response_model=AIChatOut)
def r_create_ai_chat_simple(progress_uuid: UUID, ai_chat_create_simple: AIChatCreateSimple, db: Session = Depends(get_db)) -> AIChatOut:
    return create_ai_chat_simple(progress_uuid, ai_chat_create_simple=ai_chat_create_simple, db=db)

@router.post("/progress/{progress_uuid}/prompt", response_model=AIPromptOut)
def r_prompt_ai_chat(progress_uuid: UUID, prompt: Prompt, db: Session = Depends(get_db), client: AIAgent = Depends(get_ai_client)) -> AIPromptOut:
    return prompt_schema_by_course(progress_uuid, prompt=prompt, db=db, client=client)