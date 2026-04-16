from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID

from core.db import get_db
from dependencies.ai_client import get_ai_client
from util.ai_agent import AIAgent

# SCHEMAS
from schemas.schema import (
    SchemaCreate,
    SchemaOut,
    FullSchemaOut,
    FullSchemaCreate
)
from schemas.message import Message
from schemas.ai_util import Prompt
from schemas.schema_generation_tasks import (
    SchemaGenerationTaskCreate,
    SchemaGenerationTaskOut
)

# SERVICES
from services.schema import (
    create_schema,
    get_schema,
    delete_schema,
    get_schema_full,
    create_schema_full,
    get_full_schema_by_course,
    get_full_schema_by_course_or_none,
    get_schema_by_course,
    # Nuevas funciones SSE
    create_generation_task,
    get_active_task_by_course,
    process_schema_generation,
    stream_schema_generation,
)

router = APIRouter(prefix="/schema", tags=["Schema"])


# ============= ENDPOINTS BÁSICOS DE SCHEMA =============

@router.post("/", summary="Crear un nuevo esquema", response_model=SchemaOut)
def r_create_schema(schema_create: SchemaCreate, db: Session = Depends(get_db)) -> SchemaOut:
    return create_schema(schema_create, db=db)


@router.get("/{uuid}", summary="Obtener un esquema por UUID", response_model=SchemaOut)
def r_get_schema(uuid: UUID, db: Session = Depends(get_db)) -> SchemaOut:
    return get_schema(uuid, db=db)


@router.delete("/{uuid}", summary="Eliminar un esquema por UUID", response_model=Message)
def r_delete_schema(uuid: UUID, db: Session = Depends(get_db)) -> Message:
    return delete_schema(uuid, db=db)


@router.get("/full/{uuid}", summary="Obtener un esquema completo por UUID", response_model=FullSchemaOut)
def r_get_full_schema(uuid: UUID, db: Session = Depends(get_db)) -> FullSchemaOut:
    return get_schema_full(uuid, db=db)


@router.post("/full/", summary="Crear un nuevo esquema completo", response_model=FullSchemaOut)
def r_create_full_schema(full_schema_create: FullSchemaCreate, db: Session = Depends(get_db)) -> FullSchemaOut:
    return create_schema_full(full_schema_create, db=db)


@router.get("/full/by_course/{course_uuid}", summary="Obtener un esquema completo por curso", response_model=FullSchemaOut | None)
def r_get_full_schema_by_course(course_uuid: UUID, db: Session = Depends(get_db)) -> FullSchemaOut | None:
    return get_full_schema_by_course_or_none(course_uuid, db=db)


@router.get("/by_course/{course_uuid}", summary="Obtener un esquema por curso", response_model=SchemaOut)
def r_get_schema_by_course(course_uuid: UUID, db: Session = Depends(get_db)) -> SchemaOut:
    return get_schema_by_course(course_uuid, db=db)


# ============= ENDPOINTS CON SSE =============

@router.post("/generate/{course_uuid}", response_model=SchemaGenerationTaskOut, summary="Iniciar generación de schema con IA")
async def r_start_schema_generation(
    course_uuid: UUID,
    prompt: Prompt,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    client: AIAgent = Depends(get_ai_client)
):
    """
    Inicia la generación de un schema con IA.
    Retorna un task_id que se usa para conectarse al stream SSE.
    """
    
    # Crear tarea
    task = create_generation_task(
        SchemaGenerationTaskCreate(
            course_uuid=course_uuid,
            prompt=prompt.prompt
        ),
        db=db
    )
    
    # Iniciar procesamiento en background
    background_tasks.add_task(process_schema_generation, task.uuid, db, client)
    
    return task


@router.get("/stream/{task_uuid}", summary="Stream SSE del progreso de generación")
async def r_stream_schema_generation(task_uuid: UUID):
    """
    Stream SSE que envía eventos de progreso de la generación.
    
    Eventos:
    - progress: { message, progress }
    - complete: { message, data }
    - error_event: { message }
    """
    
    def db_generator():
        """Generator para obtener nuevas sesiones DB"""
        while True:
            db = next(get_db())
            yield db
    
    return StreamingResponse(
        stream_schema_generation(task_uuid, db_generator()),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


@router.get("/task/active/{course_uuid}", response_model=SchemaGenerationTaskOut | None, summary="Obtener tarea activa para reconexión")
def r_get_active_task(course_uuid: UUID, db: Session = Depends(get_db)):
    """
    Obtiene la tarea activa para un curso.
    Usado para reconectarse después de un refresh de página.
    """
    return get_active_task_by_course(course_uuid, db)