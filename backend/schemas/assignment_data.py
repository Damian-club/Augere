from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class AssignmentDataBase(BaseModel):
    progress_id: UUID = Field(...)
    answer: str = Field(...)
    feedback: str = Field(...)
    success: bool = Field(...)


class AssignmentDataCreate(AssignmentDataBase):
    pass


class AssignmentDataOut(AssignmentDataBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)


class AssignmentDataUpdate(BaseModel):
    progress_id: Optional[UUID] = None
    answer: Optional[str] = None
    feedback: Optional[str] = None
    success: Optional[bool] = None
