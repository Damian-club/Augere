from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    name: str = Field(...)
    email: str = Field(...)
    avatar_path: str | None = None

class UserLogin(BaseModel):
    email: str = Field(...)
    password: str = Field(...)

class UserRegister(UserBase):
    password: str = Field(...)

class UserOut(UserBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)