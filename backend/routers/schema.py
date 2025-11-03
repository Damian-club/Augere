from fastapi import APIRouter, Depends, HTTPException
from schemas.schema import SchemaCreate, SchemaOut, FullSchemaOut, FullSchemaCreate
from schemas.message import Message
from models.schema import Schema
from core.db import get_db
from uuid import UUID

from sqlalchemy.orm import Session

from services.schema import create_schema as s_create_schema
from services.schema import get_schema as s_get_schema
from services.schema import delete_schema as s_delete_schema
from services.schema import get_schema_full as s_get_schema_full
from services.schema import create_schema_full as s_create_schema_full
from services.schema import get_full_schema_by_course as s_get_full_schema_by_course
from services.schema import get_schema_by_course as s_get_schema_by_course

router = APIRouter(prefix="/schema", tags=["Schema"])


@router.post("/", summary="Crear un nuevo esquema", response_model=SchemaOut)
def create_schema(schema_create: SchemaCreate, db=Depends(get_db)) -> SchemaOut:
    return s_create_schema(schema_create, db=db)


@router.get("/{uuid}", summary="Obtener un esquema por UUID", response_model=SchemaOut)
def get_schema(uuid: UUID, db=Depends(get_db)) -> SchemaOut:
    return s_get_schema(uuid, db=db)


@router.delete(
    "/{uuid}", summary="Eliminar un esquema por UUID", response_model=Message
)
def delete_schema(uuid: UUID, db=Depends(get_db)) -> Message:
    return s_delete_schema(uuid, db=db)

@router.get("/by_course/{course_uuid}", summary="Obtener un esquema por curso", response_model=SchemaOut)
def get_schema_by_course(course_uuid: UUID, db = Depends(get_db)) -> FullSchemaOut:
    return s_get_schema_by_course(course_uuid, db=db)

@router.get(
    "/full/{uuid}",
    summary="Obtener un esquema completo por UUID",
    response_model=FullSchemaOut,
)
def get_full_schema(uuid: UUID, db=Depends(get_db)) -> FullSchemaOut:
    return s_get_schema_full(uuid, db=db)


@router.post(
    "/full/",
    summary="Crear un nuevo esquema completo",
    response_model=FullSchemaOut,
)
def create_full_schema(full_schema_create: FullSchemaCreate, db=Depends(get_db)) -> FullSchemaOut:
    return s_create_schema_full(full_schema_create, db=db)

@router.get("/full/by_course/{course_uuid}", summary="Obtener un esquema completo por curso", response_model=FullSchemaOut)
def get_schema_by_course(course_uuid: UUID, db = Depends(get_db)) -> FullSchemaOut:
    return s_get_full_schema_by_course(course_uuid, db=db)
