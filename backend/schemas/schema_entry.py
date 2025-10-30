from pydantic import BaseModel, Field
from uuid import UUID
from enum import Enum
from typing import Optional

class EntryType(str, Enum):
    TOPIC = "topic"
    ASSIGNMENT = "assignment"

class SchemaEntryPreBase(BaseModel):
    name: str = Field(...)
    body: str = Field(...)
    context: Optional[str] = Field(None)
    entry_type: EntryType = Field(...)
    position: int = Field(...)

class SchemaEntryBase(SchemaEntryPreBase):
    category_id: UUID = Field(...)

class SchemaEntryCreate(SchemaEntryBase):
    pass

class SchemaEntryUpdate(BaseModel):
    uuid: UUID = Field(...)
    name: Optional[str] = None
    body: Optional[str] = None
    context: Optional[str] = None
    entry_type: Optional[EntryType] = None
    position: Optional[int] = None
    category_id: Optional[UUID] = None

class SchemaEntryCreateFull(SchemaEntryPreBase):
    pass

class SchemaEntryOut(SchemaEntryBase):
    uuid: UUID = Field(...)