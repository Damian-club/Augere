from services.progress import _get_progress_by_uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from util.ai_agent import AIAgent
from uuid import UUID
# MODELS ------------------------------------------
from models.assignment_data import AssignmentData
from models.progress import Progress
from models.schema_entry import SchemaEntry
#--------------------------------------------------

# SCHEMAS ------------------------------
from schemas.assignment_data import (
    AssignmentDataCreate,
    AssignmentDataOut,
    AssignmentDataUpdate,
    AssignmentDataCreateSimple
)
from schemas.message import Message
from schemas.ai_util import Prompt, PromptAssignmentData
#---------------------------------------

# Util
def _get_assignment_data_by_uuid(uuid: UUID, db: Session) -> AssignmentData:
    try:
        assignment_data: AssignmentData = (
            db.query(AssignmentData)
            .filter(AssignmentData.uuid == uuid)
            .first()
        )
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al obtener el dato de la asignación: {e}"
        )
    if not assignment_data:
        raise HTTPException(status_code=404, detail="Dato de asignación no encontrado")
    return assignment_data


def map_model_to_schema(assignment_data: AssignmentData) -> AssignmentDataOut:
    return AssignmentDataOut(
        uuid=assignment_data.uuid,
        creation_date=assignment_data.creation_date,
        progress_uuid=assignment_data.progress_uuid,
        answer=assignment_data.answer,
        feedback=assignment_data.feedback,
        success=assignment_data.success,
    )


def create_assignment_data(
    assignment_data_create: AssignmentDataCreate, db: Session
) -> AssignmentDataOut:

    try:
        assignment_data: AssignmentData = AssignmentData(
            progress_uuid=assignment_data_create.progress_uuid,
            answer=assignment_data_create.answer,
            feedback=assignment_data_create.feedback,
            success=assignment_data_create.success,
        )

        if assignment_data.success:
            progress: Progress = _get_progress_by_uuid(
                assignment_data_create.progress_uuid, db=db
            )
            progress.finished = True

        db.add(assignment_data)
        db.commit()
        db.refresh(assignment_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Error al crear el dato de la asignación: {e}"
        )

    return map_model_to_schema(assignment_data)


def update_assignment_data(
    uuid: UUID,
    assignment_data_update: AssignmentDataUpdate,
    db: Session
) -> AssignmentDataOut:
    assignment_data: AssignmentDataOut = _get_assignment_data_by_uuid(
        uuid, db=db
    )

    if assignment_data_update.progress_uuid is not None:
        assignment_data = assignment_data_update.progress_uuid
    if assignment_data_update.answer is not None:
        assignment_data = assignment_data_update.answer
    if assignment_data_update.feedback is not None:
        assignment_data = assignment_data_update.feedback
    if assignment_data_update.success is not None:
        assignment_data = assignment_data_update.success

    try:
        db.commit()
        db.refresh(assignment_data)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al actualizar el dato de la asignación: {e}"
        )

    return map_model_to_schema(assignment_data)


def delete_assignment_data(uuid: UUID, db: Session) -> Message:
    assignment_data: AssignmentData = _get_assignment_data_by_uuid(
        uuid, db=db
    )

    try:
        db.delete(assignment_data)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al eliminar dato de la asignación: {e}"
        )

    return Message(detail="Chat eliminado exitosamente")


def get_assignment_data(uuid: UUID, db: Session) -> AssignmentDataOut:
    assignment_data: AssignmentData = _get_assignment_data_by_uuid(uuid, db)

    return map_model_to_schema(assignment_data)

def create_assignment_data_simple(
    progress_uuid: UUID,
    assignment_data_create_simple: AssignmentDataCreateSimple,
    db: Session
) -> AssignmentDataOut:
    return create_assignment_data(
        AssignmentDataCreate(
            progress_uuid=progress_uuid,
            answer=assignment_data_create_simple.answer,
            feedback=assignment_data_create_simple.feedback,
            success=assignment_data_create_simple.success
        ),
        db=db
    )

def get_assignment_data_by_progress(
    progress_uuid: UUID, db: Session
) -> list[AssignmentDataOut]:
    progress: Progress = _get_progress_by_uuid(progress_uuid, db=db)

    return [
        map_model_to_schema(assignment_data)
        for assignment_data in progress.assignment_data_records
    ]

def answer_assignment_data(
    progress_uuid: UUID,
    prompt: Prompt,
    db: Session,
    client: AIAgent
) -> AssignmentDataOut:
    progress: Progress = _get_progress_by_uuid(progress_uuid, db=db)
    entry: SchemaEntry = progress.entry
    if not entry:
        raise HTTPException(status_code=404, detail="No existe entrada de esquema")

    prompt_assignment_data: PromptAssignmentData = client.generate_feedback(
        prompt=prompt,
        context=entry.context
    )

    assignment_data: AssignmentDataOut = create_assignment_data(
        AssignmentDataCreate(
            answer=prompt.prompt,
            feedback=prompt_assignment_data.feedback,
            success=prompt_assignment_data.success,
            progress_uuid=progress_uuid
        ),
        db=db
    )

    return assignment_data