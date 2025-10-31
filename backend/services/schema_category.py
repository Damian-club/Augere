from schemas.schema_category import SchemaCategoryCreate, SchemaCategoryOut, SchemaCategoryUpdate
from schemas.message import Message
from models.schema_category import SchemaCategory
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

def create_schema_category(
    data: SchemaCategoryCreate,
    db: Session
) -> SchemaCategoryOut:
    schema_category = SchemaCategory(
        schema_id=data.schema_id,
        name=data.name,
        position=data.position
    )
    try:
        db.add(schema_category)
        db.commit()
        db.refresh(schema_category)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear la categoría del esquema: {e}")
    
    return SchemaCategoryOut(
        uuid=schema_category.uuid,
        schema_id=schema_category.schema_id,
        name=schema_category.name,
        position=schema_category.position
    )

def update_schema_category(
    data: SchemaCategoryUpdate,
    db: Session
) -> SchemaCategoryOut:
    schema_category = db.query(SchemaCategory).filter(SchemaCategory.uuid == data.uuid).first()
    if not schema_category:
        raise HTTPException(status_code=404, detail="Categoría del esquema no encontrada")
    
    if data.name is not None:
        schema_category.name = data.name
    if data.position is not None:
        schema_category.position = data.position
    
    try:
        db.commit()
        db.refresh(schema_category)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar la categoría del esquema: {e}")
    
    return SchemaCategoryOut(
        uuid=schema_category.uuid,
        schema_id=schema_category.schema_id,
        name=schema_category.name,
        position=schema_category.position
    )

def get_schema_category(
    uuid: UUID,
    db: Session
) -> SchemaCategoryOut:
    schema_category = db.query(SchemaCategory).filter(SchemaCategory.uuid == uuid).first()
    if not schema_category:
        raise HTTPException(status_code=404, detail="Categoría del esquema no encontrada")
    
    return SchemaCategoryOut(
        uuid=schema_category.uuid,
        schema_id=schema_category.schema_id,
        name=schema_category.name,
        position=schema_category.position
    )

def delete_schema_category(
    uuid: UUID,
    db: Session
) -> Message:
    schema_category = db.query(SchemaCategory).filter(SchemaCategory.uuid == uuid).first()
    if not schema_category:
        raise HTTPException(status_code=404, detail="Categoría del esquema no encontrada")
    try:
        for entry in schema_category.entries:
            db.delete(entry)
            db.flush()

        db.delete(schema_category)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al eliminar la categoría del esquema: {e}")
    
    return Message(detail="Categoría del esquema eliminada correctamente")