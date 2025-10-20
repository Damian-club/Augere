from sqlalchemy import Column, UUID, String, Enum
from sqlalchemy.orm import Mapped
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

## SCHEMA TYPE ENUM ---
class Type_(Enum):
    TOPIC = ""
    ASSIGNMENT = ""
##---------------------

class SchemaEntry(Base):
    __tablename__ = 'schema_entry'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    name: Mapped[str] = Column(String, nullable=False)
    body: Mapped[str] = Column(String, nullable=False)
    context: Mapped[str] = Column(String, nullable=False)
    category_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    type_: Mapped[Type_] = Column(Enum(Type_, name="schema_type_enum"), nullable=False)
