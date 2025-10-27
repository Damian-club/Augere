from fastapi import APIRouter, Depends
from schemas.schema_category import SchemaCategoryCreate, SchemaCategoryOut, SchemaCategoryUpdate
from schemas.message import Message
from core.db import get_db

from services.schema_category import create_schema_category as s_create_schema_category
from services.schema_category import get_schema_category as s_get_schema_category
from services.schema_category import delete_schema_category as s_delete_schema_category
from services.schema_category import update_schema_category as s_update_schema_category

router = APIRouter(prefix='/schema_category', tags=['Schema Category'])

@router.post("/", summary="Crear una nueva categoría de esquema", response_model=SchemaCategoryOut)
def create_schema_category(
    data: SchemaCategoryCreate,
    db = Depends(get_db)
):
    return s_create_schema_category(data, db)

@router.get("/{uuid}", summary="Obtener una categoría de esquema por UUID", response_model=SchemaCategoryOut)
def get_schema_category(
    uuid: str,
    db = Depends(get_db)
):
    return s_get_schema_category(uuid, db)

@router.delete("/{uuid}", summary="Eliminar una categoría de esquema por UUID", response_model=Message)
def delete_schema_category(
    uuid: str,
    db = Depends(get_db)
):
    return s_delete_schema_category(uuid, db)

@router.put("/{uuid}", summary="Actualizar una categoría de esquema por UUID", response_model=SchemaCategoryOut)
def update_schema_category(
    uuid: str,
    data: SchemaCategoryUpdate,
    db = Depends(get_db)
):
    return s_update_schema_category(uuid, data, db)