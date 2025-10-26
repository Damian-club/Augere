from fastapi import APIRouter, Depends
from schemas.course import CourseCreate, CourseOut, CourseUpdate
from uuid import UUID
from schemas.message import Message
from models.user import User
from fastapi import HTTPException
from core.db import get_db
from dependencies.user import get_current_user
from typing import List

from services.course import create_course as s_create_course
from services.course import update_course as s_update_course
from services.course import list_user_courses as s_list_user_courses
from services.course import delete_course as s_delete_course
from services.course import get_course as s_get_course

router = APIRouter(prefix='/course', tags=['Course'])

@router.post("/create", summary="Crear un nuevo curso", response_model=CourseOut)
def create_course(
    data: CourseCreate,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        return s_create_course(data, user, db)
    except Exception as e:
        raise HTTPException(400, f"Error al crear curso: {e}")
    
@router.put("/update", summary="Actualizar un curso", response_model=CourseOut)
def update_course(
    data: CourseUpdate,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        return s_update_course(data, user, db)
    except Exception as e:
        raise HTTPException(400, f"Error al actualizar curso: {e}")

@router.get("/get", summary="Obtener un curso por UUID", response_model=CourseOut)
def get_course(
    course_uuid: UUID,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        return s_get_course(course_uuid, user, db)
    except Exception as e:
        raise HTTPException(400, f"Error al obtener curso: {e}")

@router.delete("/delete", summary="Eliminar un curso", response_model=Message)
def delete_course(
    course_uuid: UUID,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        return s_delete_course(course_uuid, user, db)
    except Exception as e:
        raise HTTPException(400, f"Error al eliminar curso: {e}")

@router.get("/my-courses", summary="Listar mis cursos", response_model=List[CourseOut])
def list_my_courses(
    user: User = Depends(get_current_user)
):
    try:
        return s_list_user_courses(user)
    except Exception as e:
        raise HTTPException(400, f"Error al listar cursos: {e}")