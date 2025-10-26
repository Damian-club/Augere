from pydantic import BaseModel, Field
from uuid import UUID

class SchemaCategoryBase(BaseModel):
    schema_id: UUID = Field(...)
    name: str = Field(...)
    position: int = Field(...)

class SchemaCategoryCreate(SchemaCategoryBase):
    pass

class SchemaCategoryOut(SchemaCategoryBase):
    uuid: UUID = Field(...)
