from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class StudentBase(BaseModel):
    student_uuid: UUID = Field(...)
    course_uuid: UUID = Field(...)


class StudentCreate(StudentBase):
    pass


class StudentOut(StudentBase):
    uuid: UUID = Field(...)
    inscription_date: datetime = Field(...)
