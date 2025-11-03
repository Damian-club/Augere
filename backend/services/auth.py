from sqlalchemy.orm import Session
from datetime import timedelta
from models.user import User
from core.settings import settings

# API ------------------
from fastapi import (
    HTTPException,
    status
)
#-----------------------

# UTIL -------------------
from util.auth import (
    verify_password,
    get_password_hash,
    create_access_token
)
#-------------------------

# SCHEMAS ------------------------------
from schemas.user import (
    UserLogin,
    UserRegister,
    UserOut,
    UserUpdate
)
from schemas.message import Message
from schemas.token import Token
#--------------------------------------

def map_model_to_schema(user: User) -> UserOut:
    return UserOut(
        name=user.name,
        email=user.email,
        avatar_path=user.avatar_path,
        uuid=user.uuid,
        creation_date=user.creation_date,
    )

def login(user_login: UserLogin, db: Session) -> Token:
    user: User = db.query(User).filter(User.email == user_login.email).first()

    if not user or not verify_password(user_login.password, user.pwd_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    return create_token(user)


def register(user_register: UserRegister, db: Session) -> Token:
    existing_user: User | None = db.query(User).filter(User.email == user_register.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario ya existente",
        )

    hashed_password: str = get_password_hash(user_register.password)

    user: User = User(
        name=user_register.name,
        email=user_register.email,
        pwd_hash=hashed_password,
        avatar_path=user_register.avatar_path,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear el usuario: {e}",
        )

    return create_token(user)


def create_token(user: User) -> Token:
    access_token_expires: timedelta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token: str = create_access_token(
        data={
            "sub": str(user.uuid)
        },
        expires_delta=access_token_expires,
    )

    return Token(access_token=access_token, token_type="bearer")


def me(user: User) -> UserOut:
    return map_model_to_schema(user)


def update_account(user: User, user_update: UserUpdate, db: Session) -> UserOut:
    if user_update.name:
        user.name = user_update.name
    if user_update.email:
        user.email = user_update.email
    if user_update.password:
        user.pwd_hash = get_password_hash(user_update.password)
    if user_update.avatar_path:
        user.avatar_path = user_update.avatar_path
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar la cuenta: {e}",
        )

    return map_model_to_schema(user)


def delete_account(user: User, db: Session) -> Message:
    try:
        db.delete(user)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al eliminar la cuenta: {e}",
        )

    return Message(detail="Cuenta eliminada exitosamente")
