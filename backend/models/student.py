from sqlalchemy import Column, UUID, JSON
from sqlalchemy.orm import Mapped
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class Student(Base):
    __tablename__ = 'students'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    student_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    course_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    progress: Mapped[dict] = Column(JSON, nullable=False)