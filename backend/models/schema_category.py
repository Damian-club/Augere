from sqlalchemy import UUID, String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class SchemaCategory(Base):
    __tablename__ = 'schema_category'

    uuid: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    schema_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), ForeignKey('schema.uuid'),nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    schema: Mapped["Schema"] = relationship(back_populates="categories")
    entries: Mapped[list["SchemaEntry"]] = relationship(back_populates="category")