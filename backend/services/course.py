from schemas.course import CourseCreate, CourseOut, CourseUpdate, CourseOutUser
from schemas.message import Message
from models.course import Course
from models.user import User
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from typing import List

# Util
def _get_course_by_uuid(course_uuid, db):
    try:
        course: Course = db.query(Course).filter(Course.uuid == course_uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener el curso: {e}")
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return course

def create_course(
    data: CourseCreate,
    user: User,
    db: Session
) -> CourseOut:
    if data.invitation_code is None:
        data.invitation_code = uuid4().hex[:8]

    course = Course(
        title=data.title,
        description=data.description,
        logo_path=data.logo_path,
        invitation_code=data.invitation_code,
        tutor_id=user.uuid
    )
    try:
        db.add(course)
        db.commit()
        db.refresh(course)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el curso: {e}")
    
    return CourseOut(
        uuid=course.uuid,
        title=course.title,
        description=course.description,
        logo_path=course.logo_path,
        invitation_code=course.invitation_code,
        tutor_id=course.tutor_id,
        creation_date=course.creation_date
    )
    
def update_course(
    data: CourseUpdate,
    user: User,
    db: Session
) -> CourseOut:
    course: Course = _get_course_by_uuid(course_uuid=data.uuid, db=db)
    
    if course.tutor_id != user.uuid:
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar este curso")
    
    if data.title is not None:
        course.title = data.title
    if data.description is not None:
        course.description = data.description
    if data.logo_path is not None:
        course.logo_path = data.logo_path
    if data.invitation_code is not None:
        course.invitation_code = data.invitation_code
    
    try:
        db.commit()
        db.refresh(course)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar el curso: {e}")
    
    return CourseOut(
        uuid=course.uuid,
        title=course.title,
        description=course.description,
        logo_path=course.logo_path,
        invitation_code=course.invitation_code,
        tutor_id=course.tutor_id,
        creation_date=course.creation_date
    )

def delete_course(
    course_uuid: UUID,
    user: User,
    db: Session
) -> Message:
    course: Course = _get_course_by_uuid(course_uuid=course_uuid, db=db)

    if course.tutor_id != user.uuid:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este curso")
    
    try:
        db.delete(course)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar el curso: {e}")
    
    return Message(message="Curso eliminado exitosamente")

def get_course(
    course_uuid: UUID,
    user: User,
    db: Session
) -> CourseOut:
    course = _get_course_by_uuid(course_uuid, db)
    if course.tutor_id != user.uuid:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este curso")
    
    return CourseOut(
        uuid=course.uuid,
        title=course.title,
        description=course.description,
        logo_path=course.logo_path,
        invitation_code=course.invitation_code,
        tutor_id=course.tutor_id,
        creation_date=course.creation_date
    )

def get_course_user(
    course_uuid: UUID,
    user: User,
    db: Session
) -> CourseOut:
    course = _get_course_by_uuid(course_uuid, db)
    if course.tutor_id != user.uuid:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este curso")
    
    return CourseOutUser(
        uuid=course.uuid,
        title=course.title,
        description=course.description,
        logo_path=course.logo_path,
        invitation_code=course.invitation_code,
        tutor_id=course.tutor_id,
        creation_date=course.creation_date,
        tutor_name=course.tutor.name
    )

def list_user_tutored_courses(
    user: User
) -> List[CourseOut]:
    courses = user.tutored_courses if user else []
    
    return [
        CourseOut(
            uuid=course.uuid,
            title=course.title,
            description=course.description,
            logo_path=course.logo_path,
            invitation_code=course.invitation_code,
            tutor_id=course.tutor_id,
            creation_date=course.creation_date
        )
        for course in courses
    ]


def list_user_enrolled_courses(
    user: User
) -> List[CourseOut]:
    courses = user.student_records if user else []
    
    return [
        CourseOut(
            uuid=course.uuid,
            title=course.title,
            description=course.description,
            logo_path=course.logo_path,
            invitation_code=course.invitation_code,
            tutor_id=course.tutor_id,
            creation_date=course.creation_date
        )
        for course in courses
    ]