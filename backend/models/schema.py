from sqlalchemy import Column, UUID
from sqlalchemy.orm import Mapped
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class Schema(Base):
    __tablename__ = 'schemas'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    course_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)