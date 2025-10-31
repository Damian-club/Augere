from schemas.schema_category import SchemaCategoryCreate, SchemaCategoryOut, SchemaCategoryUpdate
from schemas.message import Message
from models.schema_category import SchemaCategory
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

def map_model_to_schema(schema_category):
    return SchemaCategoryOut(
        uuid=schema_category.uuid,
        schema_id=schema_category.schema_id,
        name=schema_category.name,
        position=schema_category.position
    )

def _get_schema_from_uuid(uuid, db):
    try:
        schema_category = db.query(SchemaCategory).filter(SchemaCategory.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener el curso: {e}")
    if not schema_category:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return schema_category

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
    
    return map_model_to_schema(schema_category)


def update_schema_category(
    data: SchemaCategoryUpdate,
    db: Session
) -> SchemaCategoryOut:
    schema_category = _get_schema_from_uuid(data.uuid, db)
    
    if data.name is not None:
        schema_category.name = data.name
    if data.position is not None:
        schema_category.position = data.position
    
    try:
        db.commit()
        db.refresh(schema_category)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar la categoría del esquema: {e}")
    
    return map_model_to_schema(schema_category)

def get_schema_category(
    uuid: UUID,
    db: Session
) -> SchemaCategoryOut:
    schema_category = _get_schema_from_uuid(uuid, db)
    if not schema_category:
        raise HTTPException(status_code=404, detail="Categoría del esquema no encontrada")
    
    return map_model_to_schema(schema_category)

def delete_schema_category(
    uuid: UUID,
    db: Session
) -> Message:
    schema_category = _get_schema_from_uuid(uuid, db)
    if not schema_category:
        raise HTTPException(status_code=404, detail="Categoría del esquema no encontrada")
    try:
        db.delete(schema_category)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar la categoría del esquema: {e}")
    
    return Message(detail="Categoría del esquema eliminada correctamente")