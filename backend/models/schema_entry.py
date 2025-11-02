from sqlalchemy import UUID, String, Enum as SqlEnum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4
from enum import Enum


## SCHEMA TYPE ENUM ---
class EntryType(Enum):
    TOPIC = "topic"
    ASSIGNMENT = "assignment"


##---------------------


class SchemaEntry(Base):
    __tablename__ = "schema_entry"

    uuid: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    body: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    context: Mapped[str] = mapped_column(String, nullable=True)
    category_uuid: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("schema_category.uuid"), nullable=False
    )
    entry_type: Mapped[EntryType] = mapped_column(
        SqlEnum(
            EntryType, native_enum=False, values_callable=lambda x: [e.value for e in x]
        ),
        nullable=False,
    )

    category: Mapped["SchemaCategory"] = relationship(back_populates="entries")
    progress_records: Mapped[list["Progress"]] = relationship(
        back_populates="entry", cascade="all, delete-orphan"
    )
