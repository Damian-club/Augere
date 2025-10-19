from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    name: str = Field(...)
    email: str = Field(...)
    avatar_path: str = Field(...)

class UserCreate(UserBase):
    password: str = Field(...)

class UserOut(UserBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)