from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class SchemaCategoryBase(BaseModel):
    schema_id: UUID = Field(...)
    name: str = Field(...)
    position: int = Field(...)

class SchemaCategoryCreate(SchemaCategoryBase):
    pass

class SchemaCategoryUpdate(BaseModel):
    uuid: UUID = Field(...)
    name: Optional[str] = None
    position: Optional[int] = None

class SchemaCategoryOut(SchemaCategoryBase):
    uuid: UUID = Field(...)
