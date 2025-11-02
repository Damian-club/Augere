from sqlalchemy import UUID, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4


class Schema(Base):
    __tablename__ = "schema"

    uuid: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4
    )
    course_uuid: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course.uuid"), nullable=False, unique=True
    )

    course: Mapped["Course"] = relationship("Course", back_populates="schema")
    categories: Mapped[list["SchemaCategory"]] = relationship(
        "SchemaCategory", back_populates="schema", cascade="all, delete-orphan"
    )
