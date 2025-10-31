from schemas.progress import ProgressCreate, ProgressOut, ProgressUpdate
from schemas.message import Message
from models.progress import Progress
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

# Util
def _get_progress_by_uuid(progress_uuid, db):
    try:
        progress: Progress = db.query(Progress).filter(Progress.uuid == progress_uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener el progreso: {e}")
    if not progress:
        raise HTTPException(status_code=404, detail="Progreso no encontrado")
    return progress

def map_model_to_schema(progress: Progress):
    return ProgressOut(
        uuid=progress.uuid,
        entry_id=progress.entry_id,
        student_id=progress.student_id,
        finished=progress.finished
    )

def create_progress(
    data: ProgressCreate,
    db: Session
) -> ProgressOut:
    
    progress = Progress(
        entry_id=data.entry_id,
        student_id=data.student_id,
        finished=data.finished
    )
    
    try:
        db.add(progress)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el progreso: {e}")
    
    return map_model_to_schema(progress)
    
def update_progress(
    data: ProgressUpdate,
    db: Session
) -> ProgressOut:
    progress: ProgressOut = _get_progress_by_uuid(progress_uuid=data.uuid, db=db)
    
    if data.entry_id is not None:
        progress = data.entry_id
    if data.student_id is not None:
        progress = data.student_id
    if data.finished is not None:
        progress = data.finished

    try:
        db.commit()
        db.refresh(progress)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar el progreso: {e}")
    
    return map_model_to_schema(progress)

def delete_progress(
    progress_uuid: UUID,
    db: Session
) -> Message:
    progress: Progress = _get_progress_by_uuid(progress_uuid=progress_uuid, db=db)
    
    try:
        db.delete(progress)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar progreso: {e}")
    
    return Message(detail="Chat eliminado exitosamente")

def get_progress(
    progress_uuid: UUID,
    db: Session
) -> ProgressOut:
    progress = _get_progress_by_uuid(progress_uuid, db)
    
    return map_model_to_schema(progress)