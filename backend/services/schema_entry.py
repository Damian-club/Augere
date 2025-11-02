from schemas.schema_entry import SchemaEntryCreate, SchemaEntryOut, SchemaEntryUpdate
from schemas.message import Message
from models.schema_entry import SchemaEntry
from models.schema_category import SchemaCategory
from models.user import User
from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID


# Util
def _get_entry_by_uuid(uuid: UUID, db: Session) -> SchemaEntry:
    try:
        entry: SchemaEntry = (
            db.query(SchemaEntry).filter(SchemaEntry.uuid == uuid).first()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener la entrada: {e}")
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
    return entry


def map_model_to_schema(schema_entry: SchemaEntry) -> SchemaEntryOut:
    return SchemaEntryOut(
        uuid=schema_entry.uuid,
        name=schema_entry.name,
        body=schema_entry.body,
        position=schema_entry.position,
        context=schema_entry.context,
        category_id=schema_entry.category_id,
        entry_type=schema_entry.entry_type,
    )


def create_schema_entry(schema_entry_create: SchemaEntryCreate, db: Session) -> SchemaEntryOut:
    schema_entry: SchemaEntry = SchemaEntry(
        name=schema_entry_create.name,
        body=schema_entry_create.body,
        position=schema_entry_create.position,
        context=schema_entry_create.context,
        category_id=schema_entry_create.category_id,
        entry_type=schema_entry_create.entry_type,
    )

    try:
        db.add(schema_entry)
        db.commit()
        db.refresh(schema_entry)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear la entrada: {e}")

    return map_model_to_schema(schema_entry)


def update_schema_entry(uuid: UUID, schema_entry_update: SchemaEntryUpdate, db: Session) -> SchemaEntryOut:
    schema_entry: SchemaEntry = _get_entry_by_uuid(uuid, db=db)

    if schema_entry_update.name is not None:
        schema_entry.name = schema_entry_update.name
    if schema_entry_update.body is not None:
        schema_entry.body = schema_entry_update.body
    if schema_entry_update.context is not None:
        schema_entry.context = schema_entry_update.context
    if schema_entry_update.entry_type is not None:
        schema_entry.entry_type = schema_entry_update.entry_type
    if schema_entry_update.position is not None:
        schema_entry.position = schema_entry_update.position
    if schema_entry_update.category_id is not None:
        schema_entry.category_id = schema_entry_update.category_id

    try:
        db.commit()
        db.refresh(schema_entry)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al actualizar la entrada: {e}"
        )

    return map_model_to_schema(schema_entry)


def delete_schema_entry(uuid: UUID, db: Session) -> Message:
    schema_entry: SchemaEntry = _get_entry_by_uuid(uuid, db=db)

    try:
        db.delete(schema_entry)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al eliminar la entrada: {e}"
        )

    return Message(detail="Entrada eliminada exitosamente")


def get_schema_entry(uuid: UUID, db: Session) -> SchemaEntryOut:
    schema_entry: SchemaEntry = _get_entry_by_uuid(uuid, db)

    return map_model_to_schema(schema_entry)
