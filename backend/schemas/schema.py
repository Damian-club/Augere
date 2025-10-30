from pydantic import BaseModel, Field
from schemas.schema_category import SchemaCategoryOut, SchemaCategoryCreateFull
from schemas.schema_entry import SchemaEntryOut, SchemaEntryCreateFull
from uuid import UUID
from typing import List

class SchemaBase(BaseModel):
    course_id: UUID = Field(...)

class SchemaCreate(SchemaBase):
    pass

class SchemaOut(SchemaBase):
    uuid: UUID = Field(...)

class FullSchemaCategoryCreate(SchemaCategoryCreateFull):
    entry_list: List[SchemaEntryCreateFull] = Field(default_factory=list)

class FullSchemaCreate(SchemaCreate):
    category_list: List[FullSchemaCategoryCreate] = Field(default_factory=list)

class FullSchemaCategoryOut(SchemaCategoryOut):
    entry_list: List[SchemaEntryOut] = Field(default_factory=list)

class FullSchemaOut(SchemaOut):
    category_list: List[FullSchemaCategoryOut] = Field(default_factory=list)