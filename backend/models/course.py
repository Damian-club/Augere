from sqlalchemy import UUID, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, List
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4


class Course(Base):
    __tablename__ = "course"

    uuid: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4
    )
    creation_date: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    logo_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    invitation_code: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    tutor_id: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.uuid"), nullable=False
    )

    tutor: Mapped["User"] = relationship("User", back_populates="tutored_courses")
    students: Mapped[List["Student"]] = relationship(
        "Student", back_populates="course", cascade="all, delete-orphan"
    )
    schema: Mapped["Schema"] = relationship(
        "Schema", back_populates="course", uselist=False, cascade="all, delete-orphan"
    )
