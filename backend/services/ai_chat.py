from schemas.ai_chat import AIChatCreate, AIChatOut, AIChatUpdate, AIChatCreateSimple, AIPromptOut
from schemas.message import Message
from models.ai_chat import AIChat, Author
from models.progress import Progress
from models.schema_entry import SchemaEntry
from schemas.ai_util import Prompt
from services.progress import _get_progress_by_uuid
from util.ai_agent import AIAgent
from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID


def _get_ai_chat_by_uuid(uuid: UUID, db: Session) -> AIChat:
    try:
        ai_chat: AIChat = db.query(AIChat).filter(AIChat.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al obtener el chat de IA: {e}"
        )
    if not ai_chat:
        raise HTTPException(status_code=404, detail="Chat de IA no encontrado")
    return ai_chat


def map_model_to_schema(ai_chat: AIChat) -> AIChatOut:
    return AIChatOut(
        uuid=ai_chat.uuid,
        creation_date=ai_chat.creation_date,
        progress_uuid=ai_chat.progress_uuid,
        author=ai_chat.author,
        content=ai_chat.content,
    )


def create_ai_chat(ai_chat_create: AIChatCreate, db: Session) -> AIChatOut:

    ai_chat: AIChat = AIChat(
        progress_uuid=ai_chat_create.progress_uuid,
        author=ai_chat_create.author,
        content=ai_chat_create.content,
    )

    try:
        db.add(ai_chat)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al crear el chat de IA: {e}"
        )

    return map_model_to_schema(ai_chat)


def update_ai_chat(uuid: UUID, ai_chat_update: AIChatUpdate, db: Session) -> AIChatOut:
    ai_chat: AIChatOut = _get_ai_chat_by_uuid(uuid, db=db)

    if ai_chat_update.progress_uuid is not None:
        ai_chat = ai_chat_update.progress_uuid
    if ai_chat_update.author is not None:
        ai_chat = ai_chat_update.author
    if ai_chat_update.content is not None:
        ai_chat = ai_chat_update.content

    try:
        db.commit()
        db.refresh(ai_chat)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al actualizar el chat de IA: {e}"
        )

    return map_model_to_schema(ai_chat)


def delete_ai_chat(uuid: UUID, db: Session) -> Message:
    ai_chat: AIChat = _get_ai_chat_by_uuid(uuid, db=db)

    try:
        db.delete(ai_chat)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al eliminar el chat de IA: {e}"
        )

    return Message(detail="Chat eliminado exitosamente")


def get_ai_chat(uuid: UUID, db: Session) -> AIChatOut:
    ai_chat: AIChat = _get_ai_chat_by_uuid(uuid, db=db)

    return map_model_to_schema(ai_chat)


def get_ai_chat_by_progress(progress_uuid: UUID, db: Session) -> list[AIChatOut]:
    progress: Progress = _get_progress_by_uuid(progress_uuid, db=db)

    return [map_model_to_schema(ai_chat) for ai_chat in progress.ai_chat_records]

def create_ai_chat_simple(progress_uuid: UUID, ai_chat_create_simple: AIChatCreateSimple, db: Session) -> AIChatOut:
    return create_ai_chat(
        AIChatCreate(
            author=ai_chat_create_simple.author,
            content=ai_chat_create_simple.content,
            progress_uuid=progress_uuid
        ),
        db=db
    )



def prompt_schema_by_course(progress_uuid: UUID, prompt: Prompt, db: Session, client: AIAgent) -> AIPromptOut:
    progress: Progress = _get_progress_by_uuid(progress_uuid, db=db)
    schema_entry: SchemaEntry = progress.entry
    if not schema_entry:
        raise HTTPException(status_code=404, detail="Schema Entry no fue encontrado")

    user_message: AIChatOut = create_ai_chat(
        AIChatCreate(
            author=Author.USER,
            content=prompt.prompt,
            progress_uuid=progress_uuid
        ),
        db=db
    )

    chat_history: list[AIChatOut] = get_ai_chat_by_progress(progress_uuid, db=db)
    ai_hint: str = client.generate_hint(
        prompt=prompt.prompt,
        context=schema_entry.context,
        ai_chat_out_list=chat_history
    )

    ai_message: AIChatOut = create_ai_chat(
        AIChatCreate(
            author=Author.AI,
            content=ai_hint,
            progress_uuid=progress_uuid
        ),
        db=db
    )

    return AIPromptOut(
        user=user_message,
        ai=ai_message
    )