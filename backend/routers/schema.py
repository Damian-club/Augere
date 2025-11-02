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

from services import schema as schema_service

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


# CAMBIOS
@router.get("/full/by-course/{course_id}", response_model=FullSchemaOut, summary="Obtener esquema completo por course_id")
def get_full_schema_by_course(course_id: UUID, db: Session = Depends(get_db)):
    """
    Retorna el esquema completo asociado a un curso buscando por course_id.
    """
    try:
        # Buscar el schema por course_id
        schema = db.query(Schema).filter(Schema.course_id == course_id).first()
        if not schema:
            raise HTTPException(status_code=404, detail="No existe esquema para este curso")
        # Reutilizar el mapper del servicio para devolver el FullSchemaOut
        return schema_service._map_schema_to_full_schema_out(schema)
    except HTTPException:
        # Propagar 404 u otras HTTPException tal cual
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener esquema: {e}")