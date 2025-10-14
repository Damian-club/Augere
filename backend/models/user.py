from sqlalchemy import Column, UUID, String, DateTime
from sqlalchemy.orm import Mapped
from datetime import datetime
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

class User(Base):
    __tablename__ = 'users'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    creation_date: Mapped[datetime] = Column(DateTime, nullable=False, default=datetime.now)
    name: Mapped[str] = Column(String, nullable=False)
    email: Mapped[str] = Column(String, nullable=False)
    pwd_hash: Mapped[str] = Column(String, nullable=False)
    pwd_salt: Mapped[str] = Column(String, nullable=False)
    avatar_path: Mapped[str] = Column(String, nullable=False)