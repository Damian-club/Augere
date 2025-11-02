from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class StudentBase(BaseModel):
    student_id: UUID = Field(...)
    course_id: UUID = Field(...)


class StudentCreate(StudentBase):
    pass


class StudentOut(StudentBase):
    uuid: UUID = Field(...)
    inscription_date: datetime = Field(...)
