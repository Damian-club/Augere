from sqlalchemy import UUID, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4
from typing import List

class Schema(Base):
    __tablename__ = 'schema'

    uuid: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    course_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), ForeignKey('course.uuid'), nullable=False, unique=True)

    course: Mapped["Course"] = relationship(back_populates="schema")
    categories: Mapped[List["SchemaCategory"]] = relationship(back_populates="schema")