from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class AssignmentDataPreBase(BaseModel):
    answer: str = Field(...)
    feedback: str = Field(...)
    success: bool = Field(...)

class AssignmentDataBase(AssignmentDataPreBase):
    progress_uuid: UUID = Field(...)

class AssignmentDataCreate(AssignmentDataBase):
    pass

class AssignmentDataCreateSimple(AssignmentDataPreBase):
    pass

class AssignmentDataOut(AssignmentDataBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)

class AssignmentDataUpdate(BaseModel):
    progress_uuid: Optional[UUID] = None
    answer: Optional[str] = None
    feedback: Optional[str] = None
    success: Optional[bool] = None
