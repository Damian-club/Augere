from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class CourseBase(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    logo_path: Optional[str] = Field(None)
    

class CourseCreate(CourseBase):
    invitation_code: Optional[str] = Field(None)

class CourseUpdate(BaseModel):
    uuid: UUID = Field(...)
    title: Optional[str] = None
    description: Optional[str] = None
    logo_path: Optional[str] = None
    invitation_code: Optional[str] = None

class CourseOut(CourseBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)
    tutor_id: UUID = Field(...)
    invitation_code: str = Field(...)

class CourseOutUser(CourseOut):
    tutor_name: str = Field(...)