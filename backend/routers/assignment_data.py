from core.db import get_db
from uuid import UUID

# API -----------------
from fastapi import (
    APIRouter,
    Depends
)
#----------------------

# SCHEMAS ----------------------------
from schemas.assignment_data import (
    AssignmentDataCreate,
    AssignmentDataOut,
    AssignmentDataUpdate,
)
from schemas.message import Message
#-------------------------------------

# SERVICES -----------------------------
from services.assignment_data import (
    create_assignment_data,
    delete_assignment_data,
    get_assignment_data,
    update_assignment_data,
    get_assignment_data_by_progress
)
#---------------------------------------

router = APIRouter(prefix="/assignment_data", tags=["Assignment Data"])


@router.post("/", response_model=AssignmentDataOut)
def r_create_assignment_data(assignment_data_create: AssignmentDataCreate, db=Depends(get_db)) -> AssignmentDataOut:
    return create_assignment_data(assignment_data_create, db=db)


@router.get("/{uuid}", response_model=AssignmentDataOut)
def r_get_assignment_data(uuid: UUID, db=Depends(get_db)) -> AssignmentDataOut:
    return get_assignment_data(uuid, db=db)


@router.put("/{uuid}", response_model=AssignmentDataOut)
def r_update_assignment_data(uuid: UUID, assignment_data_update: AssignmentDataUpdate, db=Depends(get_db)) -> AssignmentDataOut:
    return update_assignment_data(uuid, assignment_data_update=assignment_data_update, db=db)


@router.delete("/{uuid}", response_model=Message)
def r_delete_assignment_data(uuid: UUID, db=Depends(get_db)) -> Message:
    return delete_assignment_data(uuid, db=db)


@router.get("/list/{progress_uuid}", response_model=list[AssignmentDataOut])
def r_get_assignment_data_by_progress(uuid: UUID, db=Depends(get_db)) -> list[AssignmentDataOut]:
    return get_assignment_data_by_progress(uuid, db=db)
