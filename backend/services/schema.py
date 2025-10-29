from schemas.schema import SchemaCreate, SchemaOut, FullSchemaOut, FullSchemaCategory
from schemas.message import Message
from schemas.schema_category import SchemaCategoryOut
from schemas.schema_entry import SchemaEntryOut
from models.schema import Schema
from models.schema_category import SchemaCategory
from models.schema_entry import SchemaEntry
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

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
    
    return SchemaOut(
        uuid=schema.uuid,
        course_id=schema
    )

def get_schema(
    uuid: UUID,
    db: Session
) -> SchemaOut:
    try:
        schema = db.query(Schema).filter(Schema.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el esquema: {e}")
    if not schema:
        raise HTTPException(status_code=404, detail="Esquema no encontrado")
    
    return SchemaOut(
        uuid=schema.uuid,
        course_id=schema.course_id
    )

def get_schema_full(
    uuid: UUID,
    db: Session
):
    try:
        schema = db.query(Schema).filter(Schema.uuid == uuid).first()
        schema_categories: List[SchemaCategory] = schema.categories
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el esquema: {e}")

    try:
        mapped_schema: FullSchemaOut = FullSchemaOut(
            uuid=schema.uuid,
            course_id=schema.course_id,
            category_list=[]
        )

        for schema_category in schema_categories:
            entry_list: List[SchemaEntry] = schema_category.entries

            mapped_entry_list: List[SchemaEntryOut] = [
                SchemaEntryOut(
                    uuid=entry.uuid,
                    name=entry.name,
                    body=entry.body,
                    context=entry.context,
                    category_id=entry.category_id,
                    entry_type=entry.entry_type
                )
                for entry in entry_list
            ]

            full_schema_category: List[FullSchemaCategory] = FullSchemaCategory(
                uuid=schema_category.uuid,
                schema_id=schema_category.schema_id,
                name=schema_category.name,
                position=schema_category.position,
                entry_list=mapped_entry_list
            )

            mapped_schema.category_list.append(full_schema_category)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al mapear el esquema: {e}")
    
    return mapped_schema

def delete_schema(
    uuid: UUID,
    db: Session
) -> Message:
    try:
        schema = db.query(Schema).filter(Schema.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el esquema: {e}")
    if not schema:
        raise HTTPException(status_code=404, detail="Esquema no encontrado")
    try:
        db.delete(schema)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar el esquema: {e}")
    
    return Message(message="Esquema eliminado correctamente")