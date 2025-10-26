from pydantic import BaseModel, Field
from uuid import UUID

class ProgressBase(BaseModel):
    entry_id: UUID = Field(...)
    student_id: UUID = Field(...)
    finished: bool = Field(...)

class ProgressCreate(ProgressBase):
    pass

class ProgressOut(ProgressBase):
    uuid: UUID = Field(...)
