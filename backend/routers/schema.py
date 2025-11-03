from models.schema import Schema
from core.db import get_db
from uuid import UUID
from sqlalchemy.orm import Session

# API ------------------
from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
#-----------------------

# SCHEMAS -----------------------------
from schemas.schema import (
    SchemaCreate,
    SchemaOut,
    FullSchemaOut,
    FullSchemaCreate
)
from schemas.message import Message
#--------------------------------------

# SERVICES --------------------------
from services.schema import (
    create_schema,
    get_schema,
    delete_schema,
    get_schema_full,
    create_schema_full,
    get_full_schema_by_course,
    get_schema_by_course
)
#-----------------------------------

router = APIRouter(prefix="/schema", tags=["Schema"])


@router.post("/", summary="Crear un nuevo esquema", response_model=SchemaOut)
def r_create_schema(schema_create: SchemaCreate, db=Depends(get_db)) -> SchemaOut:
    return create_schema(schema_create, db=db)


@router.get("/{uuid}", summary="Obtener un esquema por UUID", response_model=SchemaOut)
def r_get_schema(uuid: UUID, db=Depends(get_db)) -> SchemaOut:
    return get_schema(uuid, db=db)


@router.delete(
    "/{uuid}", summary="Eliminar un esquema por UUID", response_model=Message
)
def r_delete_schema(uuid: UUID, db=Depends(get_db)) -> Message:
    return delete_schema(uuid, db=db)

@router.get(
    "/full/{uuid}",
    summary="Obtener un esquema completo por UUID",
    response_model=FullSchemaOut,
)
def r_get_full_schema(uuid: UUID, db=Depends(get_db)) -> FullSchemaOut:
    return get_schema_full(uuid, db=db)


@router.post(
    "/full/",
    summary="Crear un nuevo esquema completo",
    response_model=FullSchemaOut,
)
def r_create_full_schema(full_schema_create: FullSchemaCreate, db=Depends(get_db)) -> FullSchemaOut:
    return create_schema_full(full_schema_create, db=db)

@router.get("/full/by_course/{course_uuid}", summary="Obtener un esquema completo por curso", response_model=FullSchemaOut)
def r_get_schema_by_course(course_uuid: UUID, db = Depends(get_db)) -> FullSchemaOut:
    return get_full_schema_by_course(course_uuid, db=db)

@router.get("/by_course/{course_uuid}", summary="Obtener un esquema por curso", response_model=SchemaOut)
def r_get_schema_by_course(course_uuid: UUID, db = Depends(get_db)) -> FullSchemaOut:
    return get_schema_by_course(course_uuid, db=db)