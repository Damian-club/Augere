from schemas.message import Message
from models.progress import Progress
from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

# SCHEMAS -----------------------
from schemas.progress import (
    ProgressCreate,
    ProgressOut,
    ProgressUpdate
)
#--------------------------------

# Util
def _get_progress_by_uuid(uuid: UUID, db: Session) -> Progress:
    try:
        progress: Progress = (
            db.query(Progress).filter(Progress.uuid == uuid).first()
        )
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al obtener el progreso: {e}"
        )
    if not progress:
        raise HTTPException(status_code=404, detail="Progreso no encontrado")
    return progress

def map_model_to_schema(progress: Progress) -> ProgressOut:
    return ProgressOut(
        uuid=progress.uuid,
        entry_uuid=progress.entry_uuid,
        student_uuid=progress.student_uuid,
        finished=progress.finished,
    )


def create_progress(progress_create: ProgressCreate, db: Session) -> ProgressOut:
    try:
        existing_progress: Progress = (
            db.query(Progress)
            .filter(
                Progress.entry_uuid == progress_create.entry_uuid,
                Progress.student_uuid == progress_create.student_uuid
            )
            .first()
        )

        if existing_progress:
            existing_progress.finished = progress_create.finished
            db.commit()
            db.refresh(existing_progress)
            return map_model_to_schema(existing_progress)
        else:
            new_progress = Progress(
                entry_uuid=progress_create.entry_uuid,
                student_uuid=progress_create.student_uuid,
                finished=progress_create.finished
            )
            db.add(new_progress)
            db.commit()
            db.refresh(new_progress)
            return map_model_to_schema(new_progress)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear o actualizar progreso: {e}")

def update_progress(uuid: UUID, progress_update: ProgressUpdate, db: Session) -> ProgressOut:
    progress: Progress = _get_progress_by_uuid(uuid, db=db)

    if progress_update.entry_uuid is not None:
        progress.entry_uuid = progress_update.entry_uuid
    if progress_update.student_uuid is not None:
        progress.student_uuid = progress_update.student_uuid
    if progress_update.finished is not None:
        progress.finished = progress_update.finished

    try:
        db.commit()
        db.refresh(progress)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al actualizar el progreso: {e}"
        )

    return map_model_to_schema(progress)

def delete_progress(uuid: UUID, db: Session) -> Message:
    progress: Progress = _get_progress_by_uuid(uuid, db=db)

    try:
        db.delete(progress)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar progreso: {e}")

    return Message(detail="Chat eliminado exitosamente")


def get_progress(progress_uuid: UUID, db: Session) -> ProgressOut:
    progress: Progress = _get_progress_by_uuid(progress_uuid, db)

    return map_model_to_schema(progress)

def get_by_student(db: Session, student_uuid: UUID):
    return db.query(Progress).filter(Progress.student_uuid == student_uuid).all()