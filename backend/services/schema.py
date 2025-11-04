from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from util.ai_agent import AIAgent

# SCHEMAS -----------------------------------------------
from schemas.schema import (
    SchemaCreate,
    SchemaOut,
    FullSchemaOut,
    FullSchemaCategoryOut,
    FullSchemaCreate,
    FullSchemaCategoryCreate,
    SchemaEntryCreateFull
)
from schemas.message import Message
from schemas.schema_entry import SchemaEntryOut
from schemas.ai_util import Prompt, PromptSchemaFull
#-------------------------------------------------------

# MODELS -------------------------------------------
from models.schema import Schema
from models.schema_category import SchemaCategory
from models.schema_entry import SchemaEntry
from models.course import Course
from models.student import Student
from models.progress import Progress
#---------------------------------------------------

# Util
def _map_schema_to_full_schema_out(schema: Schema) -> FullSchemaOut:
    try:
        mapped_categories: list[FullSchemaCategoryOut] = []
        for schema_category in schema.categories:
            mapped_entries: list[SchemaEntryOut] = [
                SchemaEntryOut(
                    uuid=entry.uuid,
                    name=entry.name,
                    body=entry.body,
                    context=entry.context,
                    category_uuid=entry.category_uuid,
                    entry_type=entry.entry_type,
                    position=entry.position,
                )
                for entry in schema_category.entries
            ]

            mapped_category: FullSchemaCategoryOut = FullSchemaCategoryOut(
                uuid=schema_category.uuid,
                schema_uuid=schema_category.schema_uuid,
                name=schema_category.name,
                position=schema_category.position,
                entry_list=mapped_entries,
            )
            mapped_categories.append(mapped_category)

        full_schema: FullSchemaOut = FullSchemaOut(
            uuid=schema.uuid,
            course_uuid=schema.course_uuid,
            category_list=mapped_categories,
        )

        return full_schema
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al mapear el esquema: {e}")

def _delete_existing_schema_for_course(course_uuid: UUID, db: Session) -> None:
    try:
        existing_schema = db.query(Schema).filter(Schema.course_uuid == course_uuid).first()
        if existing_schema:
            db.delete(existing_schema)
            db.flush()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar esquema existente: {e}")

def map_model_to_schema(schema: Schema) -> SchemaOut:
    return SchemaOut(uuid=schema.uuid, course_uuid=schema.course_uuid)


def _get_schema_by_uuid(uuid: UUID, db: Session) -> Schema:
    try:
        schema: Schema = db.query(Schema).filter(Schema.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el esquema: {e}")
    if not schema:
        raise HTTPException(status_code=404, detail="Esquema no encontrado")
    return schema

def _get_schema_by_course_uuid(course_uuid: UUID, db: Session) -> Schema:
    try:
        schema: Schema = db.query(Schema).filter(Schema.course_uuid == course_uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el esquema: {e}")
    if not schema:
        raise HTTPException(status_code=404, detail="Esquema no encontrado")
    return schema

# Basic schema CRUD
def create_schema(schema_create: SchemaCreate, db: Session) -> SchemaOut:
    _delete_existing_schema_for_course(schema_create.course_uuid, db)
    schema: Schema = Schema(course_uuid=schema_create.course_uuid)
    
    try:
        db.add(schema)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear el esquema: {e}")

    return map_model_to_schema(schema)


def get_schema(uuid: UUID, db: Session) -> SchemaOut:
    schema: Schema = _get_schema_by_uuid(uuid, db)

    return map_model_to_schema(schema)


def delete_schema(uuid: UUID, db: Session) -> Message:
    schema: Schema = _get_schema_by_uuid(uuid, db)
    try:
        db.delete(schema)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al eliminar el esquema: {e}"
        )

    return Message(detail="Esquema eliminado correctamente")


def create_schema_full(full_schema_create: FullSchemaCreate, db: Session) -> FullSchemaOut:
    _delete_existing_schema_for_course(full_schema_create.course_uuid, db)
    schema: Schema = Schema(course_uuid=full_schema_create.course_uuid)

    course: Course = schema.course
    student_list: list[Student] = course.students

    try:
        db.add(schema)
        db.flush()

        for category_list in full_schema_create.category_list:
            schema_category: SchemaCategory = SchemaCategory(
                schema_uuid=schema.uuid,
                name=category_list.name,
                position=category_list.position,
            )

            db.add(schema_category)
            db.flush()

            for entry in category_list.entry_list:
                schema_entry: SchemaEntry = SchemaEntry(
                    name=entry.name,
                    body=entry.body,
                    context=entry.context,
                    category_uuid=schema_category.uuid,
                    entry_type=entry.entry_type,
                    position=entry.position,
                )
                db.add(schema_entry)
                db.flush()

                for student in student_list:
                    progress: Progress = Progress(
                        entry_uuid=schema_entry.uuid,
                        student_uuid=student.uuid,
                        finished=False,
                    )
                    db.add(progress)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el esquema: {e}")

    db.commit()
    db.refresh(schema)

    return _map_schema_to_full_schema_out(schema=schema)


def get_schema_full(uuid: UUID, db: Session) -> FullSchemaOut:
    schema: Schema = _get_schema_by_uuid(uuid, db)

    return _map_schema_to_full_schema_out(schema)


def get_full_schema_by_course(course_uuid: UUID, db: Session) -> FullSchemaOut:
    schema: Schema = _get_schema_by_course_uuid(course_uuid, db=db)

    return _map_schema_to_full_schema_out(schema)


def get_schema_by_course(course_uuid: UUID, db: Session) -> SchemaOut:
    schema: Schema = _get_schema_by_course_uuid(course_uuid, db=db)

    return map_model_to_schema(schema)

def prompt_schema_by_course(course_uuid: UUID, prompt: Prompt, db: Session, client: AIAgent) -> FullSchemaOut:
    ai_schema: PromptSchemaFull = client.generate_schema(prompt)
    ai_schema.category_list

    return create_schema_full(
        full_schema_create=FullSchemaCreate(
            course_uuid=course_uuid,
            category_list=[
                FullSchemaCategoryCreate(
                    name=ai_category.name,
                    position=ai_category_idx,
                    entry_list=[
                        SchemaEntryCreateFull(
                            name=ai_entry.name,
                            body=ai_entry.body,
                            context=ai_entry.context,
                            entry_type=ai_entry.entry_type,
                            position=ai_entry_idx
                        )
                        for ai_entry_idx, ai_entry in enumerate(ai_category.entry_list, start=1)
                    ]
                )
                for ai_category_idx, ai_category in enumerate(ai_schema.category_list, start=1)
            ]
        ),
        db=db
    )