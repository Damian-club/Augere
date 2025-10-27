from fastapi import APIRouter, Depends
from schemas.student import StudentOut, StudentCreate, StudentDelete
from schemas.message import Message
from models.user import User
from core.db import get_db
from dependencies.user import get_current_user

from services.student import create_student as s_create_student
from services.student import delete_student as s_delete_student
from services.student import join_course as s_join_course
from services.student import get_student as s_get_student

router = APIRouter(prefix='/student', tags=['Student'])

@router.post("/", summary="Inscribir un estudiante a un curso", response_model=StudentOut)
def create_student(
    data: StudentCreate,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    return s_create_student(data, user, db)

@router.delete("/", summary="Eliminar un estudiante de un curso", response_model=Message)
def delete_student(
    data: StudentDelete,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    return s_delete_student(data, user, db)

@router.get("/{uuid}", summary="Obtener información de un estudiante", response_model=StudentOut)
def get_student(
    uuid: str,
    db = Depends(get_db)
):
    return s_get_student(uuid, db)

@router.post("/join", summary="Unirse a un curso mediante código de invitación", response_model=StudentOut)
def join_course(
    invitation_code: str,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    return s_join_course(invitation_code, user, db)