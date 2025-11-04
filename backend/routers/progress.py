from core.db import get_db
from uuid import UUID
from sqlalchemy.orm import Session

# API ------------------
from fastapi import (
    APIRouter,
    Depends
)
#-----------------------

# SCHEMAS ----------------------------
from schemas.progress import (
    ProgressCreate,
    ProgressOut,
    ProgressUpdate
)
from schemas.message import Message
#------------------------------------

# SERVICES ------------------------
from services.progress import (
    create_progress,
    delete_progress,
    get_progress,
    update_progress
)
#----------------------------------

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post("/", response_model=ProgressOut)
def r_create_progress(progress_create: ProgressCreate, db: Session = Depends(get_db)) -> ProgressOut:
    return create_progress(progress_create, db=db)


@router.get("/{uuid}", response_model=ProgressOut)
def r_get_progress(uuid: UUID, db: Session = Depends(get_db)) -> ProgressOut:
    return get_progress(uuid, db=db)


@router.put("/{uuid}", response_model=ProgressOut)
def r_update_progress(uuid: UUID, progress_update: ProgressUpdate, db: Session = Depends(get_db)) -> ProgressOut:
    return update_progress(uuid, progress_update=progress_update, db=db)


@router.delete("/{uuid}", response_model=Message)
def r_delete_progress(uuid: UUID, db: Session = Depends(get_db)) -> Message:
    return delete_progress(uuid, db=db)
