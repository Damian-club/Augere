from fastapi import APIRouter, Depends
from schemas.course import CourseCreate, CourseOut, CourseUpdate, CourseOutUser
from uuid import UUID
from schemas.message import Message
from models.user import User
from core.db import get_db
from dependencies.user import get_current_user

from services.course import create_course as s_create_course
from services.course import update_course as s_update_course
from services.course import list_user_tutored_courses as s_list_user_tutored_courses
from services.course import list_user_enrolled_courses as s_list_user_enrolled_courses
from services.course import delete_course as s_delete_course
from services.course import get_course_user as s_get_course_user
from services.course import get_course as s_get_course

router = APIRouter(prefix="/course", tags=["Course"])


@router.post("/", summary="Crear un nuevo curso", response_model=CourseOut)
def create_course(
    course_create: CourseCreate, user: User = Depends(get_current_user), db=Depends(get_db)
) -> CourseOut:
    return s_create_course(course_create, user=user, db=db)


@router.put("/{uuid}", summary="Actualizar un curso", response_model=CourseOut)
def update_course(
    uuid: UUID,
    course_update: CourseUpdate,
    user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> CourseOut:
    return s_update_course(uuid, course_update=course_update, user=user, db=db)


@router.get(
    "/enrolled-courses", summary="Listar mis cursos", response_model=list[CourseOutUser]
)
def list_my_courses(user: User = Depends(get_current_user), db=Depends(get_db)) -> list[CourseOutUser]:
    return s_list_user_enrolled_courses(user, db=db)


@router.get(
    "/tutored-courses",
    summary="Listar cursos que tutoreo",
    response_model=list[CourseOut],
)
def list_tutored_courses(
    user: User = Depends(get_current_user),
) -> list[CourseOut]:
    return s_list_user_tutored_courses(user)


@router.get(
    "/user/{uuid}",
    summary="Obtener un curso de usuario por UUID",
    response_model=CourseOutUser,
)
def get_course_user(
    uuid: UUID, user: User = Depends(get_current_user), db=Depends(get_db)
) -> CourseOutUser:
    return s_get_course_user(uuid, user=user, db=db)


@router.get("/{uuid}", summary="Obtener un curso por UUID", response_model=CourseOut)
def get_course(uuid: UUID, user: User = Depends(get_current_user), db=Depends(get_db)) -> CourseOut:
    return s_get_course(uuid, user=user, db=db)


@router.delete("/{uuid}", summary="Eliminar un curso", response_model=Message)
def delete_course(
    uuid: UUID, user: User = Depends(get_current_user), db=Depends(get_db)
) -> Message:
    return s_delete_course(uuid, user=user, db=db)
