from core.db import get_db
from uuid import UUID
from sqlalchemy.orm import Session
from services import progress as progress_service
from models.progress import Progress
from models.student import Student

# API ------------------
from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
#-----------------------

# SCHEMAS ----------------------------
from schemas.progress import (
    ProgressCreate,
    ProgressOut,
    ProgressUpdate
)
from schemas.message import Message
#------------------------------------

# SERVICES ------------------------
from services.progress import (
    create_progress,
    delete_progress,
    get_progress,
    update_progress
)
#----------------------------------

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post("/", response_model=ProgressOut)
def r_create_progress(progress_create: ProgressCreate, db: Session = Depends(get_db)) -> ProgressOut:
    return create_progress(progress_create, db=db)


@router.get("/{uuid}", response_model=ProgressOut)
def r_get_progress(uuid: UUID, db: Session = Depends(get_db)) -> ProgressOut:
    return get_progress(uuid, db=db)


@router.put("/{uuid}", response_model=ProgressOut)
def r_update_progress(uuid: UUID, progress_update: ProgressUpdate, db: Session = Depends(get_db)) -> ProgressOut:
    return update_progress(uuid, progress_update=progress_update, db=db)


@router.delete("/{uuid}", response_model=Message)
def r_delete_progress(uuid: UUID, db: Session = Depends(get_db)) -> Message:
    return delete_progress(uuid, db=db)

@router.get("/by_student/{student_uuid}", response_model=list[ProgressOut])
def get_progress_by_student(student_uuid: UUID, db: Session = Depends(get_db)):
    progresses = progress_service.get_by_student(db, student_uuid)
    if progresses is None:
        raise HTTPException(status_code=404, detail="No se encontraron progresos para este estudiante.")
    return progresses

@router.delete("/reset/{student_uuid}", response_model=Message)
def r_reset_progress(student_uuid: UUID, db: Session = Depends(get_db)):
    deleted = db.query(Progress).filter(Progress.student_uuid == student_uuid).delete()
    db.commit()
    return Message(detail=f"Se eliminaron {deleted} progresos del estudiante {student_uuid}.")

# En routers/progress.py o como script temporal
@router.post("/migrate-progress/{course_uuid}")
def migrate_progress(course_uuid: UUID, db: Session = Depends(get_db)):
    """Migra progresos de user_uuid a student_uuid"""
    
    # Obtén todos los estudiantes del curso
    students = db.query(Student).filter(Student.course_uuid == course_uuid).all()
    
    migrated_count = 0
    for student in students:
        # Busca progresos con el user_uuid (antiguos)
        old_progresses = db.query(Progress).filter(
            Progress.student_uuid == student.student_uuid  # UUID del usuario
        ).all()
        
        for old_prog in old_progresses:
            # Actualiza al UUID del registro Student
            old_prog.student_uuid = student.uuid  # UUID del registro Student
            migrated_count += 1
        
        print(f"✅ Migrados {len(old_progresses)} progresos para {student.user.name}")
    
    db.commit()
    return {"migrated": migrated_count}

@router.delete("/cleanup-duplicates/{student_uuid}")
def cleanup_duplicates(student_uuid: UUID, db: Session = Depends(get_db)):
    """Elimina registros de progreso duplicados, manteniendo el más reciente"""
    
    # Obtén todos los progresos del estudiante
    progresses = db.query(Progress).filter(
        Progress.student_uuid == student_uuid
    ).all()
    
    # Agrupa por entry_uuid
    by_entry = {}
    for prog in progresses:
        key = str(prog.entry_uuid)
        if key not in by_entry:
            by_entry[key] = []
        by_entry[key].append(prog)
    
    deleted_count = 0
    # Para cada entry, mantén solo el más reciente
    for entry_uuid, progs in by_entry.items():
        if len(progs) > 1:
            # Ordena por fecha de creación (o por otro criterio)
            progs.sort(key=lambda p: p.uuid)  # Usa timestamp si tienes
            
            # Elimina todos excepto el último
            for prog in progs[:-1]:
                db.delete(prog)
                deleted_count += 1
                print(f"🗑️ Eliminado duplicado: {prog.uuid}")
    
    db.commit()
    return {"deleted": deleted_count}