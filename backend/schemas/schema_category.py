from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class SchemaCategoryPreBase(BaseModel):
    name: str = Field(...)
    position: int = Field(...)


class SchemaCategoryBase(SchemaCategoryPreBase):
    schema_uuid: UUID = Field(...)


class SchemaCategoryCreate(SchemaCategoryBase):
    pass


class SchemaCategoryCreateFull(SchemaCategoryPreBase):
    pass


class SchemaCategoryUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None


class SchemaCategoryOut(SchemaCategoryBase):
    uuid: UUID = Field(...)
