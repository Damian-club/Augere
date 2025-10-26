from pydantic import BaseModel, Field
from uuid import UUID

class SchemaBase(BaseModel):
    course_id: UUID = Field(...)

class SchemaCreate(SchemaBase):
    pass

class SchemaOut(SchemaBase):
    uuid: UUID = Field(...)
