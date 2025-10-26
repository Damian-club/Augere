from sqlalchemy import UUID, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from datetime import datetime
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class User(Base):
    __tablename__ = 'user'

    uuid: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    creation_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    pwd_hash: Mapped[str] = mapped_column(String, nullable=False)
    avatar_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    tutored_courses: Mapped[List["Course"]] = relationship("Course", back_populates="tutor")
    student_records: Mapped[List["Student"]] = relationship("Student", back_populates="student")
