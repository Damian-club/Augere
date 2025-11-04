from schemas.course import (
    CourseCreate,
    CourseOut,
    CourseUpdate,
    PrivateSummaryCourseOut,
    PrivateSummaryStudentProgress,
    PrivateSummaryStudent,
    PublicSummaryCourseOut,
    OverviewCourse,
    OverviewOut
)
from schemas.message import Message
from models.course import Course
from models.user import User
from models.student import Student
from models.progress import Progress
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from services.auth import map_model_to_schema as user_map_model_to_schema
from schemas.user import UserOut
from uuid import UUID, uuid4
from util.percentage import get_percentage
import pandas as pd
from io import BytesIO, StringIO

def _get_course_by_uuid(uuid: UUID, db: Session) -> Course:
    try:
        course: Course = db.query(Course).filter(Course.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener el curso: {e}")
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return course

def _get_df_by_uuid(uuid: UUID, db: Session) -> pd.DataFrame:
    course: Course = _get_course_by_uuid(uuid, db=db)
    summary: PrivateSummaryCourseOut = _map_private_summary(course)
    student_list: list[PrivateSummaryStudent] = summary.student_list

    data: list[tuple] = [
        (
            student.name,
            student.completion_percentage,
            student.completion_percentage >= 1.0
        )
        for student in student_list
    ]
    df: pd.DataFrame = pd.DataFrame(data, columns=['Estudiante', 'Porcentaje de completitud', 'Terminó el curso'])

    return df


def _map_private_summary(course: Course) -> PrivateSummaryCourseOut:
    student_model_list: list[Student] = course.students
    user_model_list: list[User] = [student.user for student in student_model_list]

    student_count: int = len(student_model_list)

    student_list: list[PrivateSummaryStudent] = []

    completion_sum: float = 0.0
    for student, user in zip(student_model_list, user_model_list):
        progress_model_list: list[Progress] = student.progress_records

        progress_count: int = len(progress_model_list)
        progress_true_count: int = sum(1 for progress in progress_model_list if progress.finished)

        progress_list: list[PrivateSummaryStudentProgress] = [
            PrivateSummaryStudentProgress(
                entry_uuid=progress.entry_uuid,
                finished=progress.finished
            )
            for progress in progress_model_list
        ]
        
        student_completion_percentage: float = get_percentage(total=progress_count, count=progress_true_count)
        completion_sum += student_completion_percentage

        student_list.append(
            PrivateSummaryStudent(
                name=user.name,
                completion_percentage=student_completion_percentage,
                progress_list=progress_list
            )
        )
    
    average_completion_percentage: float = get_percentage(total=student_count, count=completion_sum)

    return PrivateSummaryCourseOut(
        uuid=course.uuid,
        title=course.title,
        description=course.description,
        logo_path=course.logo_path,
        invitation_code=course.invitation_code,
        creation_date=course.creation_date,
        completion_percentage=average_completion_percentage,
        student_list=student_list,
        student_count=student_count
    )

def _map_public_summary(course: Course, user: User, db: Session):
    tutor: User = course.tutor

    if not tutor:
        raise HTTPException(status_code=404, detail="No existe un tutor")
    
    tutor_schema: UserOut = user_map_model_to_schema(tutor)

    from services.student import get_student_model_by_user_course
    student: Student = get_student_model_by_user_course(user.uuid, course_uuid=course.uuid, db=db)
    progress_model_list: list[Progress] = student.progress_records

    total_progress_count: int = len(progress_model_list)
    progress_true_count: int = sum(1 for progress in progress_model_list if progress.finished)

    completion_percentage: float = get_percentage(total=total_progress_count, count=progress_true_count)

    return PublicSummaryCourseOut(
        uuid=course.uuid,
        title=course.title,
        description=course.description,
        logo_path=course.logo_path,
        creation_date=course.creation_date,
        invitation_code=course.invitation_code,
        tutor=tutor_schema,
        completion_percentage=completion_percentage
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


def get_private_summary_course(uuid: UUID, user: User, db: Session) -> PrivateSummaryCourseOut:
    course: Course = _get_course_by_uuid(uuid, db=db)
    if course.tutor_uuid != user.uuid:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para ver este curso"
        )

    tutor: User = course.tutor
    if not tutor:
        raise HTTPException(status_code=404, detail="ID del tutor no encontrado")

    return _map_private_summary(course)

def get_public_summary_course(uuid: UUID, user: User, db: Session) -> PublicSummaryCourseOut:
    course: Course = _get_course_by_uuid(uuid, db=db)

    return _map_public_summary(course, user=user, db=db)

def list_user_tutored_courses(user: User) -> list[PrivateSummaryCourseOut]:
    courses: list[Course] = user.tutored_courses if user else []

    return [_map_private_summary(course) for course in courses]

def list_user_enrolled_courses(user: User, db: Session) -> list[PublicSummaryCourseOut]:
    student_records: list[Student] = user.student_records if user else []

    result: list[CourseOut] = [
        _map_public_summary(
            course=student.course,
            user=user,
            db=db
        )
        for student in student_records
    ]

    return result

def get_overview(user: User, db: Session) -> OverviewOut:
    student_model_list: list[Student] = user.student_records

    total_count: int = len(student_model_list)
    course_list: list[OverviewCourse] = []

    accumulated_percentage: float = 0.0

    for student in student_model_list:
        progress_model_list: list[Progress] = student.progress_records

        course: Course = student.course
        if not course:
            continue

        course_name: str = course.title
        course_total_count: int = len(progress_model_list)
        course_true_count: int = sum(1 for progress in progress_model_list if progress.finished)

        percentage: float = get_percentage(total=course_total_count, count=course_true_count)
        accumulated_percentage += percentage

        course_list.append(
            OverviewCourse(
                name=course_name,
                completion_percentage=percentage
            )
        )

    completion_percentage: float = get_percentage(total=total_count, count=accumulated_percentage)
    completed_count: int = sum(1 for overview_course in course_list if overview_course.completion_percentage >= 1.0)

    return OverviewOut(
        completion_percentage=completion_percentage,
        completed_count=completed_count,
        total_count=total_count,
        course_list=course_list
    )

def get_student_csv(uuid: UUID, db: Session):
    df: pd.DataFrame = _get_df_by_uuid(uuid, db=db)
    stream: StringIO = StringIO()
    df.to_csv(stream, index_label="Código estudiante")
    stream.seek(0)
    return StreamingResponse(
        stream,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Estudiantes.csv"}
    )

def get_student_excel(uuid: UUID, db: Session):
    df: pd.DataFrame = _get_df_by_uuid(uuid, db=db)
    stream: BytesIO = BytesIO()
    df.to_excel(stream, index_label="Código estudiante", engine="openpyxl")
    stream.seek(0)
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Estudiantes.xlsx"}
    )