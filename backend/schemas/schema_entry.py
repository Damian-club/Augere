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

class SchemaEntryBase(SchemaEntryPreBase):
    category_id: UUID = Field(...)

class SchemaEntryCreate(SchemaEntryBase):
    pass

class SchemaEntryCreateFull(SchemaEntryPreBase):
    pass

class SchemaEntryOut(SchemaEntryBase):
    uuid: UUID = Field(...)