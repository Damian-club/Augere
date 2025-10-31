from schemas.ai_chat import AIChatCreate, AIChatOut, AIChatUpdate
from schemas.message import Message
from models.ai_chat import AIChat
from services.progress import _get_progress_by_uuid
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

# Util
def _get_ai_chat_by_uuid(ai_chat_uuid, db):
    try:
        ai_chat: AIChat = db.query(AIChat).filter(AIChat.uuid == ai_chat_uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener el chat de IA: {e}")
    if not ai_chat:
        raise HTTPException(status_code=404, detail="Chat de IA no encontrado")
    return ai_chat

def map_model_to_schema(ai_chat: AIChat):
    return AIChatOut(
        uuid=ai_chat.uuid,
        creation_date=ai_chat.creation_date,
        progress_id=ai_chat.progress_id,
        author=ai_chat.author,
        content=ai_chat.content
    )

def create_ai_chat(
    data: AIChatCreate,
    db: Session
) -> AIChatOut:
    
    ai_chat = AIChat(
        progress_id=data.progress_id,
        author=data.author,
        content=data.content
    )
    
    try:
        db.add(ai_chat)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el chat de IA: {e}")
    
    return map_model_to_schema(ai_chat)
    
def update_ai_chat(
    data: AIChatUpdate,
    db: Session
) -> AIChatOut:
    ai_chat: AIChatOut = _get_ai_chat_by_uuid(ai_chat_uuid=data.uuid, db=db)
    
    if data.progress_id is not None:
        ai_chat = data.progress_id
    if data.author is not None:
        ai_chat = data.author
    if data.content is not None:
        ai_chat = data.content

    try:
        db.commit()
        db.refresh(ai_chat)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar el chat de IA: {e}")
    
    return map_model_to_schema(ai_chat)

def delete_ai_chat(
    ai_chat_uuid: UUID,
    db: Session
) -> Message:
    ai_chat: AIChat = _get_ai_chat_by_uuid(ai_chat_uuid=ai_chat_uuid, db=db)
    
    try:
        db.delete(ai_chat)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar el chat de IA: {e}")
    
    return Message(detail="Chat eliminado exitosamente")

def get_ai_chat(
    ai_chat_uuid: UUID,
    db: Session
) -> AIChatOut:
    ai_chat = _get_ai_chat_by_uuid(ai_chat_uuid, db=db)
    
    return map_model_to_schema(ai_chat)

def get_ai_chat_by_progress(
    progress_uuid: UUID,
    db: Session
) -> List[AIChatOut]:
    progress = _get_progress_by_uuid(progress_uuid, db=db)
    
    return [
        map_model_to_schema(ai_chat)
        for ai_chat in progress.ai_chat_records
    ]