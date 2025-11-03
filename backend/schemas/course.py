from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from schemas.user import UserOut


class CourseBase(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    logo_path: Optional[str] = Field(None)


class CourseCreate(CourseBase):
    invitation_code: Optional[str] = Field(None)


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    logo_path: Optional[str] = None
    invitation_code: Optional[str] = None


class CourseOutPre(CourseBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)
    invitation_code: str = Field(...)


class CourseOut(CourseOutPre):
    tutor_uuid: UUID = Field(...)

class PrivateSummaryStudentProgress(BaseModel):
    entry_uuid: UUID = Field(...)
    finished: bool = Field(...)

class PrivateSummaryStudent(BaseModel):
    name: str = Field(...)
    completion_percentage: float = Field(...)
    progress_list: list[PrivateSummaryStudentProgress]

class PrivateSummaryCourseOut(CourseOutPre):
    completion_percentage: float = Field(...)
    student_list: list[PrivateSummaryStudent] = Field(...)
    student_count: int = Field(...)

class PublicSummaryCourseOut(CourseOutPre):
    completion_percentage: float = Field(...)
    tutor: UserOut = Field(...)

class OverviewCourse(BaseModel):
    name: str = Field(...)

class OverviewOut(BaseModel):
    completion_percentage: float = Field(...)
    completed_count: int = Field(...)
    total_count: int = Field(...)
    course_list: list[OverviewCourse] = Field(...)
