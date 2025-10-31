from fastapi import APIRouter, Depends
from schemas.assignment_data import AssignmentDataCreate, AssignmentDataOut, AssignmentDataUpdate
from schemas.message import Message
from core.db import get_db
from uuid import UUID
from typing import List

from services.assignment_data import create_assignment_data as s_create_assignment_data
from services.assignment_data import delete_assignment_data as s_delete_assignment_data
from services.assignment_data import get_assignment_data as s_get_assignment_data
from services.assignment_data import update_assignment_data as s_update_assignment_data
from services.assignment_data import get_assignment_data_by_progress as s_get_assignment_data_by_progress

router = APIRouter(prefix='/assignment_data', tags=['Assignment Data'])

@router.post('/', response_model=AssignmentDataOut)
def create_assignment_data(data: AssignmentDataCreate, db = Depends(get_db)):
    return s_create_assignment_data(data, db)

@router.get('/', response_model=AssignmentDataOut)
def get_assignment_data(uuid: UUID, db = Depends(get_db)):
    return s_get_assignment_data(uuid, db)

@router.put('/', response_model=AssignmentDataOut)
def update_assignment_data(data: AssignmentDataUpdate, db = Depends(get_db)):
    return s_update_assignment_data(data, db)

@router.delete('/', response_model=Message)
def delete_assignment_data(uuid: UUID, db = Depends(get_db)):
    return s_delete_assignment_data(uuid, db)

@router.get('/list/{progress_uuid}', response_model=List[AssignmentDataOut])
def get_assignment_data_by_progress(uuid: UUID, db = Depends(get_db)):
    return s_get_assignment_data_by_progress(uuid, db)