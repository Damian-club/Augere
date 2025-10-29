from pydantic import BaseModel, Field
from schemas.schema_category import SchemaCategoryOut
from schemas.schema_entry import SchemaEntryOut
from uuid import UUID
from typing import List

class SchemaBase(BaseModel):
    course_id: UUID = Field(...)

class SchemaCreate(SchemaBase):
    pass

class SchemaOut(SchemaBase):
    uuid: UUID = Field(...)

class FullSchemaCategory(SchemaCategoryOut):
    entry_list: List[SchemaEntryOut] = Field(default_factory=list)

class FullSchemaOut(SchemaOut):
    category_list: List[FullSchemaCategory] = Field(default_factory=list)

