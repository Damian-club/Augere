from pydantic import BaseModel, Field
from schemas.schema_category import SchemaCategoryOut, SchemaCategoryCreateFull
from schemas.schema_entry import SchemaEntryOut, SchemaEntryCreateFull
from uuid import UUID



class SchemaBase(BaseModel):
    course_uuid: UUID = Field(...)


class SchemaCreate(SchemaBase):
    pass


class SchemaOut(SchemaBase):
    uuid: UUID = Field(...)

class FullSchemaCategoryCreate(SchemaCategoryCreateFull):
    entry_list: list[SchemaEntryCreateFull] = Field(default_factory=list)


class FullSchemaCreate(SchemaCreate):
    category_list: list[FullSchemaCategoryCreate] = Field(default_factory=list)


class FullSchemaCategoryOut(SchemaCategoryOut):
    entry_list: list[SchemaEntryOut] = Field(default_factory=list)


class FullSchemaOut(SchemaOut):
    category_list: list[FullSchemaCategoryOut] = Field(default_factory=list)