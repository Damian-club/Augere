from models.user import User
from models.student import Student
from core.db import get_db
from dependencies.user import get_current_user
from uuid import UUID
from sqlalchemy.orm import Session

# API ------------------
from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
#-----------------------

# SCHEMAS -----------------------------
from schemas.student import (
    StudentOut,
    StudentCreate
)
from schemas.message import Message
#-------------------------------------

# SERVICES ---------------------
from services.student import (
    create_student,
    delete_student,
    join_course,
    get_student
)
#-------------------------------

router = APIRouter(prefix="/student", tags=["Student"])


@router.post(
    "/", summary="Inscribir un estudiante a un curso", response_model=StudentOut
)
def r_create_student(
    student_create: StudentCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> StudentOut:
    return create_student(student_create, user=user, db=db)


@router.delete(
    "/{user_uuid}/{course_uuid}",
    summary="Eliminar estudiante de un curso",
    response_model=Message,
)
def r_delete_student(
    user_uuid: UUID,
    course_uuid: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Message:
    return delete_student(user_uuid=user_uuid, course_uuid=course_uuid, user=user, db=db)


@router.get(
    "/{uuid}", summary="Obtener información de un estudiante", response_model=StudentOut
)
def r_get_student(uuid: str, db: Session = Depends(get_db)) -> StudentOut:
    return get_student(uuid, db=db)


@router.post(
    "/join/{invitation_code}",
    summary="Unirse a un curso mediante código de invitación",
    response_model=StudentOut,
)
def r_join_course(
    invitation_code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> StudentOut:
    return join_course(invitation_code, user=user, db=db)

@router.get("/by-user-course/{user_uuid}/{course_uuid}")
def get_student_by_user_course(
    user_uuid: UUID,
    course_uuid: UUID,
    db: Session = Depends(get_db)
):
    """Obtiene el registro Student por user_uuid y course_uuid"""
    student = db.query(Student).filter(
        Student.student_uuid == user_uuid,
        Student.course_uuid == course_uuid
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    
    return {
        "uuid": student.uuid,  # ← Este es el UUID que necesitas
        "student_uuid": student.student_uuid,
        "course_uuid": student.course_uuid
    }