from schemas.schema import SchemaCreate, SchemaOut
from schemas.message import Message
from models.schema import Schema
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

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