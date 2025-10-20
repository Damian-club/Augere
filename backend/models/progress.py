from sqlalchemy import Column, UUID, Boolean
from sqlalchemy.orm import Mapped
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class Progress(Base):
    __tablename__ = 'progress'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    entry_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    student_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    course_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    finished: Mapped[bool] = Column(Boolean, nullable=False)