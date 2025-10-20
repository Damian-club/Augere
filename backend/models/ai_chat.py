from sqlalchemy import Column, UUID, String, Integer, Enum
from sqlalchemy.orm import Mapped
from datetime import datetime
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4

## AUTHOR ENUM --------
class Author(Enum):
    USER = ""
    AI = ""
#---------------------

class Ai_chat(Base):
    __tablename__ = 'ai_chats'

    uuid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4)
    position: Mapped[int] = Column(Integer, nullable=False)
    progress_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
    author: Mapped[Author] = Column(Enum(Author, name="author_enum"), nullable=False)
    content: Mapped[str] = Column(String, nullable=False)