from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class ProgressBase(BaseModel):
    entry_uuid: UUID = Field(...)
    student_uuid: UUID = Field(...)
    finished: bool = Field(...)


class ProgressCreate(ProgressBase):
    pass


class ProgressOut(ProgressBase):
    uuid: UUID = Field(...)


class ProgressUpdate(BaseModel):
    entry_uuid: Optional[UUID] = None
    student_uuid: Optional[UUID] = None
    finished: Optional[bool] = None
