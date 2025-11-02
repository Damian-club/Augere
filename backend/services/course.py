from schemas.course import CourseCreate, CourseOut, CourseUpdate, CourseOutUser
from schemas.message import Message
from models.course import Course
from models.user import User
from models.student import Student
from fastapi import HTTPException
from sqlalchemy.orm import Session
from services.auth import map_model_to_schema as user_map_model_to_schema
from schemas.user import UserOut
from uuid import UUID, uuid4


# Util
def _get_course_by_uuid(uuid: UUID, db: Session) -> Course:
    try:
        course: Course = db.query(Course).filter(Course.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener el curso: {e}")
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return course


def map_user_out_schema(course: Course, user: User) -> CourseOutUser:
    tutor_schema: UserOut  = user_map_model_to_schema(user)

    return CourseOutUser(
        uuid=course.uuid,
        title=course.title,
        description=course.description,
        logo_path=course.logo_path,
        invitation_code=course.invitation_code,
        creation_date=course.creation_date,
        tutor=tutor_schema,
    )


def map_model_to_schema(course: Course) -> CourseOut:
    return CourseOut(
        uuid=course.uuid,
        title=course.title,
        description=course.description,
        logo_path=course.logo_path,
        invitation_code=course.invitation_code,
        tutor_uuid=course.tutor_uuid,
        creation_date=course.creation_date,
    )


def create_course(course_create: CourseCreate, user: User, db: Session) -> CourseOut:
    if course_create.invitation_code is None:
        course_create.invitation_code = uuid4().hex[:8]

    course: Course = Course(
        title=course_create.title,
        description=course_create.description,
        logo_path=course_create.logo_path,
        invitation_code=course_create.invitation_code,
        tutor_uuid=user.uuid,
    )

    try:
        db.add(course)
        db.commit()
        db.refresh(course)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el curso: {e}")

    return map_model_to_schema(course)


def update_course(uuid: UUID, course_update: CourseUpdate, user: User, db: Session) -> CourseOut:
    course: Course = _get_course_by_uuid(uuid, db=db)

    if course.tutor_uuid != user.uuid:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para actualizar este curso"
        )

    if course_update.title is not None:
        course.title = course_update.title
    if course_update.description is not None:
        course.description = course_update.description
    if course_update.logo_path is not None:
        course.logo_path = course_update.logo_path
    if course_update.invitation_code is not None:
        course.invitation_code = course_update.invitation_code

    try:
        db.commit()
        db.refresh(course)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al actualizar el curso: {e}"
        )

    return map_model_to_schema(course)


def delete_course(uuid: UUID, user: User, db: Session) -> Message:
    course: Course = _get_course_by_uuid(uuid, db=db)

    if course.tutor_uuid != user.uuid:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para eliminar este curso"
        )

    try:
        db.delete(course)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar el curso: {e}")

    return Message(detail="Curso eliminado exitosamente")


def get_course(uuid: UUID, user: User, db: Session) -> CourseOut:
    course: Course = _get_course_by_uuid(uuid, db=db)
    if course.tutor_uuid != user.uuid:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para ver este curso"
        )

    return map_model_to_schema(course)


def get_course_user(uuid: UUID, user: User, db: Session) -> CourseOut:
    course: Course = _get_course_by_uuid(uuid, db=db)
    if course.tutor_uuid != user.uuid:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para ver este curso"
        )

    tutor: User = course.tutor
    if not tutor:
        raise HTTPException(status_code=404, detail="ID del tutor no encontrado")


    return map_user_out_schema(course, tutor)


def list_user_tutored_courses(user: User) -> list[CourseOut]:
    courses: list[Course] = user.tutored_courses if user else []

    return [map_model_to_schema(course) for course in courses]


def list_user_enrolled_courses(user: User, db: Session) -> list[CourseOutUser]:
    student_records: list[Student] = user.student_records if user else []

    result: list[CourseOut] = []
    for student in student_records:
        course: Course = student.course
        tutor: User = db.query(User).filter(User.uuid == course.tutor_uuid).first()

        result.append(
            map_user_out_schema(
                course=course,
                user=tutor
            )
        )

    return result