from fastapi import APIRouter, Depends
from schemas.assignment_data import (
    AssignmentDataCreate,
    AssignmentDataOut,
    AssignmentDataUpdate,
)
from schemas.message import Message
from core.db import get_db
from uuid import UUID

from services.assignment_data import create_assignment_data as s_create_assignment_data
from services.assignment_data import delete_assignment_data as s_delete_assignment_data
from services.assignment_data import get_assignment_data as s_get_assignment_data
from services.assignment_data import update_assignment_data as s_update_assignment_data
from services.assignment_data import (
    get_assignment_data_by_progress as s_get_assignment_data_by_progress,
)

router = APIRouter(prefix="/assignment_data", tags=["Assignment Data"])


@router.post("/", response_model=AssignmentDataOut)
def create_assignment_data(assignment_data_create: AssignmentDataCreate, db=Depends(get_db)) -> AssignmentDataOut:
    return s_create_assignment_data(assignment_data_create, db=db)


@router.get("/{uuid}", response_model=AssignmentDataOut)
def get_assignment_data(uuid: UUID, db=Depends(get_db)) -> AssignmentDataOut:
    return s_get_assignment_data(uuid, db=db)


@router.put("/{uuid}", response_model=AssignmentDataOut)
def update_assignment_data(uuid: UUID, assignment_data_update: AssignmentDataUpdate, db=Depends(get_db)) -> AssignmentDataOut:
    return s_update_assignment_data(uuid, assignment_data_update=assignment_data_update, db=db)


@router.delete("/{uuid}", response_model=Message)
def delete_assignment_data(uuid: UUID, db=Depends(get_db)) -> Message:
    return s_delete_assignment_data(uuid, db=db)


@router.get("/list/{progress_uuid}", response_model=list[AssignmentDataOut])
def get_assignment_data_by_progress(uuid: UUID, db=Depends(get_db)) -> list[AssignmentDataOut]:
    return s_get_assignment_data_by_progress(uuid, db=db)
