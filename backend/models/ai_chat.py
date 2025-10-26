from sqlalchemy import UUID, String, ForeignKey, Enum as SqlEnum, DateTime
from enum import Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4
from datetime import datetime

## AUTHOR ENUM --------
class Author(Enum):
    USER = "user"
    AI = "ai"
#---------------------

class AIChat(Base):
    __tablename__ = 'ai_chat'

    uuid: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    creation_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    progress_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), ForeignKey('progress.uuid'), nullable=False)
    author: Mapped[Author] = mapped_column(SqlEnum(Author, native_enum=False), nullable=False)
    content: Mapped[str] = mapped_column(String, nullable=False)

    progress: Mapped["Progress"] = relationship(back_populates="ai_chat_records")