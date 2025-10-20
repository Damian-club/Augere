from sqlalchemy import Column, UUID, String, DateTime, JSON
from sqlalchemy.orm import Mapped
from datetime import datetime
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class Course(Base):
    __tablename__ = 'courses'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    creation_date: Mapped[datetime] = Column(DateTime, nullable=False, default=datetime.now)
    title: Mapped[str] = Column(String, nullable=False)
    description: Mapped[str] = Column(String, nullable=False)
    tutor_id: Mapped[str] = Column(String, nullable=False)
    logo_path: Mapped[str] = Column(String, nullable=False)
    invitation_code: Mapped[str] = Column(String, nullable=False)
    schema: Mapped[dict] = Column(JSON, nullable=False)