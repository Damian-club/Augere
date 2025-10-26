from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class CourseBase(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    logo_path: Optional[str] = Field(None)
    invitation_code: str = Field(...)
    tutor_id: UUID = Field(...)
    schema_id: UUID = Field(...)

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)
