from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class TaskStatus(str):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class SchemaGenerationTaskCreate(BaseModel):
    course_uuid: UUID
    prompt: str

class SchemaGenerationTaskOut(BaseModel):
    uuid: UUID
    course_uuid: UUID
    prompt: str
    status: str
    progress: int
    current_step: Optional[str] = None
    error_message: Optional[str] = None
    result_schema_uuid: Optional[UUID] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True