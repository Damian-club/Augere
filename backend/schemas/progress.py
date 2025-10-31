from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class ProgressBase(BaseModel):
    entry_id: UUID = Field(...)
    student_id: UUID = Field(...)
    finished: bool = Field(...)

class ProgressCreate(ProgressBase):
    pass

class ProgressOut(ProgressBase):
    uuid: UUID = Field(...)

class ProgressUpdate(BaseModel):
    uuid: UUID = Field(...)
    entry_id: Optional[UUID] = None
    student_id: Optional[UUID] = None
    finished: Optional[bool] = None