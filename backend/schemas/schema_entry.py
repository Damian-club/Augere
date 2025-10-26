from pydantic import BaseModel, Field
from uuid import UUID
from enum import Enum
from typing import Optional

class EntryType(str, Enum):
    TOPIC = "topic"
    ASSIGNMENT = "assignment"

class SchemaEntryBase(BaseModel):
    name: str = Field(...)
    body: str = Field(...)
    context: Optional[str] = Field(None)
    category_id: UUID = Field(...)
    entry_type: EntryType = Field(...)

class SchemaEntryCreate(SchemaEntryBase):
    pass

class SchemaEntryOut(SchemaEntryBase):
    uuid: UUID = Field(...)
