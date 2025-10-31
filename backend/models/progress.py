from sqlalchemy import UUID, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4
from typing import List

class Progress(Base):
    __tablename__ = 'progress'

    uuid: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    entry_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), ForeignKey('schema_entry.uuid'), nullable=False)
    student_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), ForeignKey('student.uuid'), nullable=False)
    finished: Mapped[bool] = mapped_column(Boolean, nullable=False)

    entry: Mapped["SchemaEntry"] = relationship(back_populates="progress_records", foreign_keys=[entry_id])
    student: Mapped["Student"] = relationship(back_populates="progress_records", foreign_keys=[student_id])
    ai_chat_records: Mapped[List["AIChat"]] = relationship(back_populates="progress", cascade="all, delete-orphan")
    assignment_data_record: Mapped["AssignmentData"] = relationship(back_populates="progress", uselist=False, cascade="all, delete-orphan")