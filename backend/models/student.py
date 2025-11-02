from sqlalchemy import UUID, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4
from datetime import datetime


class Student(Base):
    __tablename__ = "student"

    uuid: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4
    )
    inscription_date: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now
    )
    student_id: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.uuid"), nullable=False
    )
    course_id: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course.uuid"), nullable=False
    )

    student: Mapped["User"] = relationship(
        "User", back_populates="student_records", foreign_keys=[student_id]
    )
    course: Mapped["Course"] = relationship(
        "Course", back_populates="students", foreign_keys=[course_id]
    )
    progress_records: Mapped[list["Progress"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
