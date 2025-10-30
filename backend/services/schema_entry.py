from schemas.schema_entry import SchemaEntryCreate, SchemaEntryOut, SchemaEntryUpdate
from schemas.message import Message
from models.schema_entry import SchemaEntry
from models.schema_category import SchemaCategory
from models.user import User
from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

# Util
def _get_entry_by_uuid(entry_uuid: UUID, db: Session) -> SchemaEntry:
    try:
        entry: SchemaEntry = db.query(SchemaEntry).filter(SchemaEntry.uuid == entry_uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener la entrada: {e}")
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
    return entry

def create_schema_entry(
    data: SchemaEntryCreate,
    db: Session
) -> SchemaEntryOut:    
    entry = SchemaEntry(
        name=data.name,
        body=data.body,
        position=data.position,
        context=data.context,
        category_id=data.category_id,
        entry_type=data.entry_type
    )
    
    try:
        db.add(entry)
        db.commit()
        db.refresh(entry)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear la entrada: {e}")
    
    return SchemaEntryOut(
        uuid=entry.uuid,
        name=entry.name,
        body=entry.body,
        position=entry.position,
        context=entry.context,
        category_id=entry.category_id,
        entry_type=entry.entry_type
    )

def update_schema_entry(
    data: SchemaEntryUpdate,
    db: Session
) -> SchemaEntryOut:
    entry: SchemaEntry = _get_entry_by_uuid(entry_uuid=data.uuid, db=db)
    
    if data.name is not None:
        entry.name = data.name
    if data.body is not None:
        entry.body = data.body
    if data.context is not None:
        entry.context = data.context
    if data.entry_type is not None:
        entry.entry_type = data.entry_type
    if data.position is not None:
        entry.position = data.position
    if data.category_id is not None:
        entry.category_id = data.category_id
    
    try:
        db.commit()
        db.refresh(entry)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar la entrada: {e}")
    
    return SchemaEntryOut(
        uuid=entry.uuid,
        name=entry.name,
        body=entry.body,
        position=entry.position,
        context=entry.context,
        category_id=entry.category_id,
        entry_type=entry.entry_type
    )

def delete_schema_entry(
    entry_uuid: UUID,
    db: Session
) -> Message:
    entry: SchemaEntry = _get_entry_by_uuid(entry_uuid=entry_uuid, db=db)

    try:
        db.delete(entry)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar la entrada: {e}")
    
    return Message(message="Entrada eliminada exitosamente")

def get_schema_entry(
    entry_uuid: UUID,
    db: Session
) -> SchemaEntryOut:
    entry = _get_entry_by_uuid(entry_uuid, db)
    
    return SchemaEntryOut(
        uuid=entry.uuid,
        name=entry.name,
        body=entry.body,
        position=entry.position,
        context=entry.context,
        category_id=entry.category_id,
        entry_type=entry.entry_type
    )