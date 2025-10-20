from sqlalchemy import Column, UUID, String, Integer
from sqlalchemy.orm import Mapped
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class schemaCategory(Base):
    __tablename__ = 'schema_categories'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    schema_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    name: Mapped[str] = Column(String, nullable=False)
    position: Mapped[int] = Column(Integer, nullable=False)