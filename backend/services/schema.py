import json
import asyncio
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from util.ai_agent import AIAgent

# SCHEMAS -----------------------------------------------
from schemas.schema import (
    SchemaCreate,
    SchemaOut,
    FullSchemaOut,
    FullSchemaCategoryOut,
    FullSchemaCreate,
    FullSchemaCategoryCreate,
    SchemaEntryCreateFull
)
from schemas.message import Message
from schemas.schema_entry import SchemaEntryOut
from schemas.ai_util import Prompt, PromptSchemaFull
from schemas.schema_generation_tasks import (
    SchemaGenerationTaskOut,
    SchemaGenerationTaskCreate
)
#-------------------------------------------------------

# MODELS -------------------------------------------
from models.schema import Schema
from models.schema_category import SchemaCategory
from models.schema_entry import SchemaEntry
from models.course import Course
from models.student import Student
from models.progress import Progress
from models.schema_generation_tasks import SchemaGenerationTask, TaskStatus
#---------------------------------------------------


# ============= UTILIDADES =============

def _map_schema_to_full_schema_out(schema: Schema) -> FullSchemaOut:
    try:
        mapped_categories: list[FullSchemaCategoryOut] = []
        for schema_category in schema.categories:
            mapped_entries: list[SchemaEntryOut] = [
                SchemaEntryOut(
                    uuid=entry.uuid,
                    name=entry.name,
                    body=entry.body,
                    context=entry.context,
                    category_uuid=entry.category_uuid,
                    entry_type=entry.entry_type,
                    position=entry.position,
                )
                for entry in schema_category.entries
            ]

            mapped_category: FullSchemaCategoryOut = FullSchemaCategoryOut(
                uuid=schema_category.uuid,
                schema_uuid=schema_category.schema_uuid,
                name=schema_category.name,
                position=schema_category.position,
                entry_list=mapped_entries,
            )
            mapped_categories.append(mapped_category)

        full_schema: FullSchemaOut = FullSchemaOut(
            uuid=schema.uuid,
            course_uuid=schema.course_uuid,
            category_list=mapped_categories,
        )

        return full_schema
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al mapear el esquema: {e}")


def _delete_existing_schema_for_course(course_uuid: UUID, db: Session) -> None:
    try:
        existing_schema = db.query(Schema).filter(Schema.course_uuid == course_uuid).first()
        if existing_schema:
            db.delete(existing_schema)
            db.flush()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al eliminar esquema existente: {e}")


def map_model_to_schema(schema: Schema) -> SchemaOut:
    return SchemaOut(uuid=schema.uuid, course_uuid=schema.course_uuid)


def _get_schema_by_uuid(uuid: UUID, db: Session) -> Schema:
    try:
        schema: Schema = db.query(Schema).filter(Schema.uuid == uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el esquema: {e}")
    if not schema:
        raise HTTPException(status_code=404, detail="Esquema no encontrado")
    return schema


def _get_schema_by_course_uuid(course_uuid: UUID, db: Session) -> Schema:
    try:
        schema: Schema = db.query(Schema).filter(Schema.course_uuid == course_uuid).first()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al buscar el esquema: {e}")
    if not schema:
        raise HTTPException(status_code=404, detail="Esquema no encontrado")
    return schema


# ============= CRUD BÁSICO DE SCHEMAS =============

def create_schema(schema_create: SchemaCreate, db: Session) -> SchemaOut:
    _delete_existing_schema_for_course(schema_create.course_uuid, db)
    schema: Schema = Schema(course_uuid=schema_create.course_uuid)
    
    try:
        db.add(schema)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear el esquema: {e}")

    return map_model_to_schema(schema)


def get_schema(uuid: UUID, db: Session) -> SchemaOut:
    schema: Schema = _get_schema_by_uuid(uuid, db)
    return map_model_to_schema(schema)


def delete_schema(uuid: UUID, db: Session) -> Message:
    schema: Schema = _get_schema_by_uuid(uuid, db)
    try:
        db.delete(schema)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error al eliminar el esquema: {e}"
        )

    return Message(detail="Esquema eliminado correctamente")


def create_schema_full(full_schema_create: FullSchemaCreate, db: Session) -> FullSchemaOut:
    _delete_existing_schema_for_course(full_schema_create.course_uuid, db)
    
    course: Course | None = db.query(Course).filter(Course.uuid == full_schema_create.course_uuid).first()
    if course is None:
        raise HTTPException(status_code=404, detail=f"Curso con UUID {full_schema_create.course_uuid} no encontrado")

    student_list: list[Student] = course.students or []

    schema: Schema = Schema(course_uuid=full_schema_create.course_uuid)

    try:
        db.add(schema)
        db.flush()

        for category_list in full_schema_create.category_list:
            schema_category: SchemaCategory = SchemaCategory(
                schema_uuid=schema.uuid,
                name=category_list.name,
                position=category_list.position,
            )

            db.add(schema_category)
            db.flush()

            for entry in category_list.entry_list:
                schema_entry: SchemaEntry = SchemaEntry(
                    name=entry.name,
                    body=entry.body,
                    context=entry.context,
                    category_uuid=schema_category.uuid,
                    entry_type=entry.entry_type,
                    position=entry.position,
                )
                db.add(schema_entry)
                db.flush()

                for student in student_list:
                    progress: Progress = Progress(
                        entry_uuid=schema_entry.uuid,
                        student_uuid=student.uuid,
                        finished=False,
                    )
                    db.add(progress)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el esquema: {e}")

    db.commit()
    db.refresh(schema)

    return _map_schema_to_full_schema_out(schema=schema)


def get_schema_full(uuid: UUID, db: Session) -> FullSchemaOut:
    schema: Schema = _get_schema_by_uuid(uuid, db)
    return _map_schema_to_full_schema_out(schema)


def get_full_schema_by_course(course_uuid: UUID, db: Session) -> FullSchemaOut:
    schema: Schema = _get_schema_by_course_uuid(course_uuid, db=db)
    return _map_schema_to_full_schema_out(schema)


def get_full_schema_by_course_or_none(course_uuid: UUID, db: Session) -> FullSchemaOut | None:
    # Verificar si hay una tarea en proceso
    active_task = get_active_task_by_course(course_uuid, db)
    if active_task:
        return None
    
    try:
        return get_full_schema_by_course(course_uuid, db=db)
    except HTTPException as e:
        if e.status_code == 404:
            return None
        raise


def get_schema_by_course(course_uuid: UUID, db: Session) -> SchemaOut:
    schema: Schema = _get_schema_by_course_uuid(course_uuid, db=db)
    return map_model_to_schema(schema)


# ============= SISTEMA DE TAREAS CON SSE =============

def create_generation_task(task_create: SchemaGenerationTaskCreate, db: Session) -> SchemaGenerationTaskOut:
    """Crea una tarea de generación de schema"""
    
    # Verificar si ya hay una tarea activa para este curso
    existing_task = db.query(SchemaGenerationTask).filter(
        SchemaGenerationTask.course_uuid == task_create.course_uuid,
        SchemaGenerationTask.status.in_([TaskStatus.PENDING, TaskStatus.PROCESSING])
    ).first()
    
    if existing_task:
        return SchemaGenerationTaskOut.from_orm(existing_task)
    
    task = SchemaGenerationTask(
        course_uuid=task_create.course_uuid,
        prompt=task_create.prompt,
        status=TaskStatus.PENDING,
        progress=0
    )
    
    try:
        db.add(task)
        db.commit()
        db.refresh(task)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creando tarea: {e}")
    
    return SchemaGenerationTaskOut.from_orm(task)


def get_task_by_uuid(task_uuid: UUID, db: Session) -> SchemaGenerationTask:
    """Obtiene una tarea por UUID"""
    task = db.query(SchemaGenerationTask).filter(
        SchemaGenerationTask.uuid == task_uuid
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    return task


def get_active_task_by_course(course_uuid: UUID, db: Session) -> SchemaGenerationTaskOut | None:
    """Obtiene la tarea activa para un curso"""
    task = db.query(SchemaGenerationTask).filter(
        SchemaGenerationTask.course_uuid == course_uuid,
        SchemaGenerationTask.status.in_([TaskStatus.PENDING, TaskStatus.PROCESSING])
    ).first()
    
    if not task:
        return None
    
    return SchemaGenerationTaskOut.from_orm(task)


async def process_schema_generation(task_uuid: UUID, db: Session, client: AIAgent):
    """Procesa la generación del schema en background"""
    task = get_task_by_uuid(task_uuid, db)
    
    try:
        # Actualizar estado a PROCESSING
        task.status = TaskStatus.PROCESSING
        task.started_at = datetime.utcnow()
        task.progress = 10
        task.current_step = "Conectando con IA..."
        db.commit()
        
        # Generar schema con IA
        task.current_step = "Generando estructura del curso..."
        task.progress = 30
        db.commit()
        
        ai_schema: PromptSchemaFull = await client.async_generate_schema(task.prompt)
        
        # Crear categorías
        task.current_step = "Creando categorías y entradas..."
        task.progress = 60
        db.commit()
        
        # Crear schema completo en BD
        full_schema = create_schema_full(
            full_schema_create=FullSchemaCreate(
                course_uuid=task.course_uuid,
                category_list=[
                    FullSchemaCategoryCreate(
                        name=ai_category.name,
                        position=ai_category_idx,
                        entry_list=[
                            SchemaEntryCreateFull(
                                name=ai_entry.name,
                                body=ai_entry.body,
                                context=ai_entry.context,
                                entry_type=ai_entry.entry_type,
                                position=ai_entry_idx
                            )
                            for ai_entry_idx, ai_entry in enumerate(ai_category.entry_list, start=1)
                        ]
                    )
                    for ai_category_idx, ai_category in enumerate(ai_schema.category_list, start=1)
                ]
            ),
            db=db
        )
        
        # Marcar como completado
        task.status = TaskStatus.COMPLETED
        task.progress = 100
        task.current_step = "¡Completado!"
        task.completed_at = datetime.utcnow()
        task.result_schema_uuid = full_schema.uuid
        db.commit()
        
    except Exception as e:
        task.status = TaskStatus.FAILED
        task.error_message = str(e)
        task.completed_at = datetime.utcnow()
        db.commit()
        raise

def serialize_data(data):
    if isinstance(data, dict):
        return {k: serialize_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [serialize_data(i) for i in data]
    elif isinstance(data, UUID):
        return str(data)
    else:
        return data
    
async def stream_schema_generation(task_uuid: UUID, db_generator):
    """Stream SSE de progreso de generación"""
    
    async def send_event(event_type: str, data: dict):
        """Helper para enviar eventos SSE"""
        return f"event: {event_type}\ndata: {json.dumps(serialize_data(data))}\n\n"
    
    try:
        # Enviar evento inicial
        yield await send_event("progress", {
            "message": "Iniciando generación...",
            "progress": 0
        })
        
        last_progress = 0
        last_step = ""
        
        while True:
            # Obtener nueva sesión DB en cada iteración
            db = next(db_generator)
            
            try:
                task = get_task_by_uuid(task_uuid, db)
                
                # Enviar actualización si cambió el progreso o el paso
                if task.progress != last_progress or task.current_step != last_step:
                    yield await send_event("progress", {
                        "message": task.current_step or "Procesando...",
                        "progress": task.progress
                    })
                    last_progress = task.progress
                    last_step = task.current_step
                
                # Verificar si terminó
                if task.status == TaskStatus.COMPLETED:
                    # Obtener el schema generado
                    schema = get_schema_full(task.result_schema_uuid, db)
                    
                    yield await send_event("complete", {
                        "message": "¡Esquema generado exitosamente!",
                        "data": schema.dict()
                    })
                    break
                
                elif task.status == TaskStatus.FAILED:
                    yield await send_event("error_event", {
                        "message": task.error_message or "Error desconocido"
                    })
                    break
                
            finally:
                db.close()
            
            # Esperar antes de la próxima actualización
            await asyncio.sleep(0.5)
            
    except Exception as e:
        yield await send_event("error_event", {
            "message": f"Error en stream: {str(e)}"
        })