from sqlalchemy import Column, UUID, Integer, String, Boolean
from sqlalchemy.orm import Mapped
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class AssignmentDict(Base):
    __tablename__ = 'users'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    position: Mapped[int] = Column(Integer, nullable=False)
    progress_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    answer: Mapped[str] = Column(String, nullable=False)
    feedback: Mapped[str] = Column(String, nullable=False)
    success: Mapped[bool] = Column(Boolean, nullable=False)