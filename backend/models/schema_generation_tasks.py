from sqlalchemy import Column, String, DateTime, Integer, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from core.db import Base

class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class SchemaGenerationTask(Base):
    __tablename__ = "schema_generation_tasks"

    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_uuid = Column(UUID(as_uuid=True), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    progress = Column(Integer, default=0)  # 0-100
    current_step = Column(String(255), nullable=True)  # "Generando categorías...", etc
    error_message = Column(Text, nullable=True)
    result_schema_uuid = Column(UUID(as_uuid=True), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<SchemaGenerationTask {self.uuid} - {self.status}>"