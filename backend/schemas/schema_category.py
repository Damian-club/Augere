from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class SchemaCategoryPreBase(BaseModel):
    name: str = Field(...)
    position: int = Field(...)

class SchemaCategoryBase(SchemaCategoryPreBase):
    schema_id: UUID = Field(...)

class SchemaCategoryCreate(SchemaCategoryBase):
    pass

class SchemaCategoryCreateFull(SchemaCategoryPreBase):
    pass

class SchemaCategoryUpdate(BaseModel):
    uuid: UUID = Field(...)
    name: Optional[str] = None
    position: Optional[int] = None

class SchemaCategoryOut(SchemaCategoryBase):
    uuid: UUID = Field(...)
