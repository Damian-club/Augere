from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class UserBase(BaseModel):
    name: str = Field(...)
    email: str = Field(...)
    avatar_path: Optional[str] = None


class UserLogin(BaseModel):
    email: str = Field(...)
    password: str = Field(...)


class UserRegister(UserBase):
    password: str = Field(...)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_path: Optional[str] = None
    password: Optional[str] = None


class UserOut(UserBase):
    uuid: UUID = Field(...)
    creation_date: datetime = Field(...)
