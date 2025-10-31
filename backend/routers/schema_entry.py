from fastapi import APIRouter, Depends
from schemas.schema_entry import SchemaEntryCreate, SchemaEntryUpdate, SchemaEntryOut
from schemas.message import Message
from core.db import get_db
from uuid import UUID

from services.schema_entry import create_schema_entry as s_create_schema_entry
from services.schema_entry import delete_schema_entry as s_delete_schema_entry
from services.schema_entry import get_schema_entry as s_get_schema_entry
from services.schema_entry import update_schema_entry as s_update_schema_entry

router = APIRouter(prefix='/schema_entry', tags=['Schema Entry'])

@router.post('/', response_model=SchemaEntryOut)
def create_schema_entry(data: SchemaEntryCreate, db = Depends(get_db)):
    return s_create_schema_entry(data, db)

@router.get('/{uuid}', response_model=SchemaEntryOut)
def get_schema_entry(uuid: UUID, db = Depends(get_db)):
    return s_get_schema_entry(uuid, db)

@router.put('/', response_model=SchemaEntryOut)
def update_schema_entry(data: SchemaEntryUpdate, db = Depends(get_db)):
    return s_update_schema_entry(data, db)

@router.delete('/{uuid}', response_model=Message)
def delete_schema_entry(uuid: UUID, db = Depends(get_db)):
    return s_delete_schema_entry(uuid, db)