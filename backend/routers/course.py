from uuid import UUID
from models.user import User
from core.db import get_db
from dependencies.user import get_current_user

# API -----------------
from fastapi import (
    APIRouter,
    Depends
)
#----------------------

# SCHEMAS ----------------------------
from schemas.course import (
    CourseCreate,
    CourseOut,
    CourseUpdate,
    PrivateSummaryCourseOut,
    PublicSummaryCourseOut,
    OverviewOut
)
from schemas.message import Message
#-------------------------------------

# SERVICES ---------------------------
from services.course import create_course as s_create_course
from services.course import update_course as s_update_course
from services.course import list_user_tutored_courses as s_list_user_tutored_courses
from services.course import list_user_enrolled_courses as s_list_user_enrolled_courses
from services.course import delete_course as s_delete_course
from services.course import get_private_summary_course as s_get_private_summary_course
from services.course import get_public_summary_course as s_get_public_summary_course
from services.course import get_course as s_get_course
from services.course import get_overview as s_get_overview
#-------------------------------------

router = APIRouter(prefix="/course", tags=["Course"])

@router.post("/", summary="Crear un nuevo curso", response_model=CourseOut)
def r_create_course(
    course_create: CourseCreate, user: User = Depends(get_current_user), db=Depends(get_db)
) -> CourseOut:
    return s_create_course(course_create, user=user, db=db)


@router.get(
    "/enrolled-courses",
    summary="Listar mis cursos inscritos",
    response_model=list[PublicSummaryCourseOut]
)
def r_list_user_enrolled_courses(user: User = Depends(get_current_user), db=Depends(get_db)) -> list[PublicSummaryCourseOut]:
    return s_list_user_enrolled_courses(user, db=db)


@router.get(
    "/tutored-courses",
    summary="Listar cursos que tutoreo",
    response_model=list[PrivateSummaryCourseOut],
)
def r_list_tutored_courses(
    user: User = Depends(get_current_user),
) -> list[PrivateSummaryCourseOut]:
    return s_list_user_tutored_courses(user)


@router.get(
    "/overview",
    summary="Obtener resumen de los cursos del usuario",
    response_model=OverviewOut,
)
def r_get_overview(
    user: User = Depends(get_current_user), db=Depends(get_db)
) -> OverviewOut:
    return s_get_overview(user, db=db)


@router.get(
    "/summary/public/{uuid}",
    summary="Obtener resumen publico de un curso",
    response_model=PublicSummaryCourseOut,
)
def r_get_public_summary_course(
    uuid: UUID, user: User = Depends(get_current_user), db=Depends(get_db)
) -> PublicSummaryCourseOut:
    return s_get_public_summary_course(uuid, user=user, db=db)


@router.get(
    "/summary/private/{uuid}",
    summary="Obtener resumen privado de un curso",
    response_model=PrivateSummaryCourseOut,
)
def r_get_private_summary_course(
    uuid: UUID, user: User = Depends(get_current_user), db=Depends(get_db)
) -> PrivateSummaryCourseOut:
    return s_get_private_summary_course(uuid, user=user, db=db)

@router.get("/{uuid}", summary="Obtener un curso por UUID", response_model=CourseOut)
def r_get_course(uuid: UUID, user: User = Depends(get_current_user), db=Depends(get_db)) -> CourseOut:
    return s_get_course(uuid, user=user, db=db)


@router.put("/{uuid}", summary="Actualizar un curso", response_model=CourseOut)
def r_update_course(
    uuid: UUID,
    course_update: CourseUpdate,
    user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> CourseOut:
    return s_update_course(uuid, course_update=course_update, user=user, db=db)


@router.delete("/{uuid}", summary="Eliminar un curso", response_model=Message)
def r_delete_course(
    uuid: UUID, user: User = Depends(get_current_user), db=Depends(get_db)
) -> Message:
    return s_delete_course(uuid, user=user, db=db)
