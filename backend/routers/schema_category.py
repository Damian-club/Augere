from core.db import get_db
from uuid import UUID

# API -----------------
from fastapi import (
    APIRouter,
    Depends
)
#----------------------

# SCHEMAS ------------------------------
from schemas.schema_category import (
    SchemaCategoryCreate,
    SchemaCategoryOut,
    SchemaCategoryUpdate,
)
from schemas.message import Message
#---------------------------------------

# SERVICES ------------------------------
from services.schema_category import (
    create_schema_category,
    get_schema_category,
    delete_schema_category,
    update_schema_category
)
#---------------------------------------

router = APIRouter(prefix="/schema_category", tags=["Schema Category"])


@router.post(
    "/",
    summary="Crear una nueva categoría de esquema",
    response_model=SchemaCategoryOut,
)
def r_create_schema_category(schema_category_create: SchemaCategoryCreate, db=Depends(get_db)) -> SchemaCategoryOut:
    return create_schema_category(schema_category_create, db=db)


@router.get(
    "/{uuid}",
    summary="Obtener una categoría de esquema por UUID",
    response_model=SchemaCategoryOut,
)
def r_get_schema_category(uuid: str, db=Depends(get_db)) -> SchemaCategoryOut:
    return get_schema_category(uuid, db=db)


@router.delete(
    "/{uuid}",
    summary="Eliminar una categoría de esquema por UUID",
    response_model=Message,
)
def r_delete_schema_category(uuid: str, db=Depends(get_db)) -> Message:
    return delete_schema_category(uuid, db=db)


@router.put(
    "/{uuid}",
    summary="Actualizar una categoría de esquema por UUID",
    response_model=SchemaCategoryOut,
)
def r_update_schema_category(uuid: UUID, schema_category_update: SchemaCategoryUpdate, db=Depends(get_db)) -> SchemaCategoryOut:
    return update_schema_category(uuid, schema_category_update=schema_category_update, db=db)
