from schemas.schema import SchemaCreate, SchemaOut, FullSchemaOut, FullSchemaCategoryOut, FullSchemaCreate
from schemas.message import Message
from schemas.schema_category import SchemaCategoryOut
from schemas.schema_entry import SchemaEntryOut
from models.schema import Schema
from models.schema_category import SchemaCategory
from models.schema_entry import SchemaEntry
from models.course import Course
from models.user import User
from models.student import Student
from models.progress import Progress
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

# Util
def _map_schema_to_full_schema_out(schema: Schema) -> FullSchemaOut:
    try:
        mapped_categories = []
        for schema_category in schema.categories:
            mapped_entries = [
                SchemaEntryOut(
                    uuid=entry.uuid,
                    name=entry.name,
                    body=entry.body,
                    context=entry.context,
                    category_id=entry.category_id,
                    entry_type=entry.entry_type,
                    position=entry.position
                )
                for entry in schema_category.entries
            ]

            mapped_category = FullSchemaCategoryOut(
                uuid=schema_category.uuid,
                schema_id=schema_category.schema_id,
                name=schema_category.name,
                position=schema_category.position,
                entry_list=mapped_entries,
            )
            mapped_categories.append(mapped_category)

        full_schema = FullSchemaOut(
            uuid=schema.uuid,
            course_id=schema.course_id,
            category_list=mapped_categories,
        )

        return full_schema
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al mapear el esquema: {e}")

def map_model_to_schema(schema):
    return SchemaOut(
        uuid=schema.uuid,
        course_id=schema.course_id
    )


def _get_schema_by_uuid(uuid: UUID, db: Session):
    try:
        schema = db.query(Schema).filter(Schema.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al mapear el esquema: {e}")
    if not schema:
        raise HTTPException(status_code=404, detail="Esquema no encontrado")
    return schema

# Basic schema CRUD
def create_schema(
    data: SchemaCreate,
    db: Session
) -> SchemaOut:
    schema = Schema(
        course_id=data.course_id,
    )
    try:
        db.add(schema)
        db.commit()
        db.refresh(schema)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el esquema: {e}")
    
    return map_model_to_schema(schema)

def get_schema(
    uuid: UUID,
    db: Session
) -> SchemaOut:
    schema = _get_schema_by_uuid(uuid, db)

    return map_model_to_schema(schema)

def delete_schema(
    uuid: UUID,
    db: Session
) -> Message:
    schema: Schema = _get_schema_by_uuid(uuid, db)
    try:
        db.delete(schema)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar el esquema: {e}")
    
    return Message(detail="Esquema eliminado correctamente")

def create_schema_full(
    data: FullSchemaCreate,
    db: Session       
) -> FullSchemaCategoryOut:
    schema = Schema(
        course_id=data.course_id
    )

    course: Course = schema.course
    student_list: List[Student] = course.students

    try:
        db.add(schema)
        db.flush()

        for category_list in data.category_list:
            schema_category = SchemaCategory(
                schema_id=schema.uuid,
                name=category_list.name,
                position=category_list.position
            )

            db.add(schema_category)
            db.flush()

            for entry in category_list.entry_list:
                schema_entry = SchemaEntry(
                    name=entry.name,
                    body=entry.body,
                    context=entry.context,
                    category_id=schema_category.uuid,
                    entry_type=entry.entry_type,
                    position=entry.position
                )
                db.add(schema_entry)
                db.flush()

                for student in student_list:
                    progress = Progress(
                        entry_id=schema_entry.uuid,
                        student_id=student.uuid,
                        finished=False
                    )
                    db.add(progress)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el esquema: {e}")
    
    db.commit()
    db.refresh(schema)

    return _map_schema_to_full_schema_out(schema=schema)

def get_schema_full(
    uuid: UUID,
    db: Session
) -> FullSchemaCategoryOut:
    schema = _get_schema_by_uuid(uuid, db)

    return _map_schema_to_full_schema_out(schema)