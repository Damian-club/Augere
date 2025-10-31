from schemas.student import StudentCreate, StudentOut, StudentDelete
from schemas.message import Message
from models.student import Student
from models.course import Course
from models.user import User
from models.course import Course
from models.schema_category import SchemaCategory
from models.schema import Schema
from models.schema_entry import SchemaEntry
from models.progress import Progress
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

def map_model_to_schema(student):
    return StudentOut(
        uuid=student.uuid,
        inscription_date=student.inscription_date,
        student_id=student.student_id,
        course_id=student.course_id
    )


def create_student(
    data: StudentCreate,
    user: User,
    db: Session
) -> StudentOut:
    if user.uuid != data.student_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para inscribir a este estudiante")

    student = Student(
        student_id=data.student_id,
        course_id=data.course_id
    )

    try:
        db.add(student)
        db.flush()
        db.refresh(student)

        course: Course = student.course
        schema: Schema = course.schema
        if schema:
            schema_categories: List[SchemaCategory] = schema.categories

            for category in schema_categories:
                schema_entries: List[SchemaEntry] = category.entries
                for entry in schema_entries:
                    progress: Progress = Progress(
                        entry_id=entry.uuid,
                        student_id=student.uuid,
                        finished=False
                    )
                    db.add(progress)

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear el curso: {e}")
    
    return map_model_to_schema(student)

def join_course(
    invitation_code: str,
    user: User,
    db: Session
) -> StudentOut:
    try:
        course: Course = db.query(Course).filter(Course.invitation_code == invitation_code).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el curso: {e}")
    
    if not course:
        raise HTTPException(status_code=404, detail="Código de invitación inválido")
    
    student_create = StudentCreate(
        student_id=user.uuid,
        course_id=course.uuid
    )

    return create_student(student_create, user, db)

def get_student(
    uuid: UUID,
    db: Session
) -> StudentOut:
    try:
        student: Student = db.query(Student).filter(Student.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el estudiante: {e}")
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return map_model_to_schema(student)

def delete_student(
    data: StudentDelete,
    user: User,
    db: Session
) -> Message:
    try:
        student: Student = db.query(Student).filter(
            Student.student_id == data.student_id,
            Student.course_id == data.course_id
        ).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el estudiante: {e}")

    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    
    course = student.course
    
    if user.uuid not in (course.tutor_id, data.student_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este estudiante")
    
    try:
        db.delete(student)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar el estudiante: {e}")
    
    return Message(detail="Estudiante eliminado exitosamente")