from schemas.assignment_data import AssignmentDataCreate, AssignmentDataOut, AssignmentDataUpdate
from schemas.message import Message
from models.assignment_data import AssignmentData
from services.progress import _get_progress_by_uuid
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

# Util
def _get_assignment_data_by_uuid(assignment_data_uuid, db):
    try:
        assignment_data: AssignmentData = db.query(AssignmentData).filter(AssignmentData.uuid == assignment_data_uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener el dato de la asignación: {e}")
    if not assignment_data:
        raise HTTPException(status_code=404, detail="Dato de asignación no encontrado")
    return assignment_data

def map_model_to_schema(assignment_data: AssignmentData):
    return AssignmentDataOut(
        uuid=assignment_data.uuid,
        creation_date=assignment_data.creation_date,
        progress_id=assignment_data.progress_id,
        answer=assignment_data.answer,
        feedback=assignment_data.feedback,
        success=assignment_data.success
    )

def create_assignment_data(
    data: AssignmentDataCreate,
    db: Session
) -> AssignmentDataOut:
    
    assignment_data = AssignmentData(
        progress_id=data.progress_id,
        answer=data.answer,
        feedback=data.feedback,
        success=data.success
    )
    
    try:
        db.add(assignment_data)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el dato de la asignación: {e}")
    
    return map_model_to_schema(assignment_data)
    
def update_assignment_data(
    data: AssignmentDataUpdate,
    db: Session
) -> AssignmentDataOut:
    assignment_data: AssignmentDataOut = _get_assignment_data_by_uuid(assignment_data_uuid=data.uuid, db=db)
    
    if data.progress_id is not None:
        assignment_data = data.progress_id
    if data.answer is not None:
        assignment_data = data.answer
    if data.feedback is not None:
        assignment_data = data.feedback
    if data.success is not None:
        assignment_data = data.success

    try:
        db.commit()
        db.refresh(assignment_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar el dato de la asignación: {e}")
    
    return map_model_to_schema(assignment_data)

def delete_assignment_data(
    assignment_data_uuid: UUID,
    db: Session
) -> Message:
    assignment_data: AssignmentData = _get_assignment_data_by_uuid(assignment_data_uuid=assignment_data_uuid, db=db)
    
    try:
        db.delete(assignment_data)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar dato de la asignación: {e}")
    
    return Message(detail="Chat eliminado exitosamente")

def get_assignment_data(
    assignment_data_uuid: UUID,
    db: Session
) -> AssignmentDataOut:
    assignment_data = _get_assignment_data_by_uuid(assignment_data_uuid, db)
    
    return map_model_to_schema(assignment_data)

def get_assignment_data_by_progress(
    progress_uuid: UUID,
    db: Session
) -> List[AssignmentDataOut]:
    progress = _get_progress_by_uuid(progress_uuid, db=db)
    
    return [
        map_model_to_schema(assignment_data)
        for assignment_data in progress.assignment_data_records
    ]