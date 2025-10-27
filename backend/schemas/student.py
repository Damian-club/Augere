from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class StudentBase(BaseModel):
    student_id: UUID = Field(...)
    course_id: UUID = Field(...)

class StudentCreate(StudentBase):
    pass

class StudentDelete(StudentBase):
    pass


class StudentUpdate(BaseModel):
    uuid: Optional[UUID] = None
    student_id: Optional[UUID] = None
    course_id: Optional[UUID] = None

class StudentOut(StudentBase):
    uuid: UUID = Field(...)
    inscription_date: datetime = Field(...)
