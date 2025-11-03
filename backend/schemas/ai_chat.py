from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional


class Author(str, Enum):
    USER = "user"
    AI = "ai"



class AIChatPreBase(BaseModel):
    author: Author = Field(...)
    content: str = Field(...)

class AIChatBase(AIChatPreBase):
    progress_uuid: UUID = Field(...)

class AIChatCreate(AIChatBase):
    pass

class AIChatCreateSimple(AIChatPreBase):
    pass

class AIChatOut(AIChatBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)

class AIChatUpdate(BaseModel):
    progress_uuid: Optional[UUID] = None
    author: Optional[Author] = None
    content: Optional[str] = None
