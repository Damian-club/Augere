from fastapi import APIRouter, Depends
from schemas.schema import SchemaCreate, SchemaOut, FullSchemaOut, FullSchemaCreate
from schemas.message import Message
from models.schema import Schema
from core.db import get_db
from uuid import UUID

from services.schema import create_schema as s_create_schema
from services.schema import get_schema as s_get_schema
from services.schema import delete_schema as s_delete_schema
from services.schema import get_schema_full as s_get_schema_full
from services.schema import create_schema_full as s_create_schema_full
from services.schema import delete_schema_full as s_delete_schema_full

router = APIRouter(prefix='/schema', tags=['Schema'])

@router.post("/", summary="Crear un nuevo esquema", response_model=SchemaOut)
def create_schema(
    data: SchemaCreate,
    db = Depends(get_db)
):
    return s_create_schema(data, db)

@router.get("/{uuid}", summary="Obtener un esquema por UUID", response_model=SchemaOut)
def get_schema(
    uuid: UUID,
    db = Depends(get_db)
):
    return s_get_schema(uuid, db)

@router.delete("/{uuid}", summary="Eliminar un esquema por UUID", response_model=Message)
def delete_schema(
    uuid: UUID,
    db = Depends(get_db)
):
    return s_delete_schema(uuid, db)

@router.get("/full/{uuid}", summary="Obtener un esquema completo por UUID", response_model=FullSchemaOut)
def get_full_schema(
    uuid: UUID,
    db = Depends(get_db)
):
    return s_get_schema_full(uuid, db)

@router.post("/full/{uuid}", summary="Crear un nuevo esquema completo", response_model=FullSchemaOut)
def create_full_schema(
    data: FullSchemaCreate,
    db = Depends(get_db)
):
    return s_create_schema_full(data, db)

@router.delete("/full/{uuid}", summary="Eliminar un esquema completo por UUID", response_model=Message)
def delete_full_schema(
    uuid: UUID,
    db = Depends(get_db)
):
    return s_delete_schema_full(uuid, db)