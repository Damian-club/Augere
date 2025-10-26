from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class AssignmentDictBase(BaseModel):
    progress_id: UUID = Field(...)
    answer: str = Field(...)
    feedback: str = Field(...)
    success: bool = Field(...)

class AssignmentDictCreate(AssignmentDictBase):
    pass

class AssignmentDictOut(AssignmentDictBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)
