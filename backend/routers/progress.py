from fastapi import APIRouter, Depends
from schemas.progress import ProgressCreate, ProgressOut, ProgressUpdate
from schemas.message import Message
from core.db import get_db
from uuid import UUID

from services.progress import create_progress as s_create_progress
from services.progress import delete_progress as s_delete_progress
from services.progress import get_progress as s_get_progress
from services.progress import update_progress as s_update_progress

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post("/", response_model=ProgressOut)
def create_progress(progress_create: ProgressCreate, db=Depends(get_db)) -> ProgressOut:
    return s_create_progress(progress_create, db=db)


@router.get("/{uuid}", response_model=ProgressOut)
def get_progress(uuid: UUID, db=Depends(get_db)) -> ProgressOut:
    return s_get_progress(uuid, db=db)


@router.put("/{uuid}", response_model=ProgressOut)
def update_progress(uuid: UUID, progress_update: ProgressUpdate, db=Depends(get_db)) -> ProgressOut:
    return s_update_progress(uuid, progress_update=progress_update, db=db)


@router.delete("/{uuid}", response_model=Message)
def delete_progress(uuid: UUID, db=Depends(get_db)) -> Message:
    return s_delete_progress(uuid, db=db)
