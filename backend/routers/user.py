from fastapi import APIRouter, Depends
from schemas.user import UserRegister, UserOut
from sqlalchemy.orm import Session
from core.db import get_db

from models.user import User
from models.course import Course
from models.ai_chat import AIChat
from models.progress import Progress
from models.student import Student
from models.assignment_dict import AssignmentDict
from models.progress import Progress
from models.schema_entry import SchemaEntry
from models.schema import Schema
from models.user import User
from models.schema_category import SchemaCategory

from dependencies.user import get_current_user

router = APIRouter(prefix='/users', tags=['Users'])

# @user_router.post('/', response_model=UserOut)
# def create_user(user_create: UserRegister, db: Session = Depends(get_db)):
#     user = User(
#         name=user_create.name,
#         email=user_create.email,
#         pwd_hash='asd',
#         pwd_salt='af',
#         avatar_path='a'
#     )

#     db.add(user)
#     db.commit()

#     return UserOut(
#         name=user.name,
#         email=user.email,
#         avatar_path=user.avatar_path,
#         uuid=user.uuid,
#         creation_date=user.creation_date
#     )

# @user_router.get('/')
# def read_user(db: Session = Depends(get_db)):
#     list_user = db.query(User).all()

#     print([user.name for user in list_user])

#     return []