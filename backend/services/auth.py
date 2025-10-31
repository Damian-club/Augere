from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from util.auth import verify_password, get_password_hash, create_access_token
from schemas.user import UserLogin, UserRegister, UserOut, UserUpdate
from schemas.message import Message
from schemas.token import Token
from models.user import User
from core.settings import settings

def map_model_to_schema(user):
    return UserOut(
        name=user.name,
        email=user.email,
        avatar_path=user.avatar_path,
        uuid=user.uuid,
        creation_date=user.creation_date,
    )

def login(data: UserLogin, db: Session):
    user: User = db.query(User).filter(User.email == data.email).first()
    
    if not user or not verify_password(data.password, user.pwd_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )


    return create_token(user)


def register(data: UserRegister, db: Session):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario ya existente",
        )

    hashed_password = get_password_hash(data.password)

    user = User(
        name=data.name,
        email=data.email,
        pwd_hash=hashed_password,
        avatar_path=data.avatar_path,
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


def create_token(user: User):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # SOLO incluye el UUID en el token (lo mínimo necesario)
    access_token = create_access_token(
        data={
            "sub": str(user.uuid),  # Usa "sub" que es el estándar JWT
            # "uuid": str(user.uuid),  # También lo dejamos por compatibilidad
        },
        expires_delta=access_token_expires,
    )
    
    return Token(access_token=access_token, token_type="bearer")


def me(user: User) -> UserOut:
    return map_model_to_schema(user)


def update_account(user: User, data: UserUpdate, db: Session) -> UserOut:
    if data.name:
        user.name = data.name
    if data.email:
        user.email = data.email
    if data.password:
        user.pwd_hash = get_password_hash(data.password)
    if data.avatar_path:
        user.avatar_path = data.avatar_path
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar la cuenta: {e}",
        )

    return map_model_to_schema(user)


def delete_account(user: User, db: Session):
    try:
        db.delete(user)
        db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al eliminar la cuenta: {e}",
        )
    
    return Message(detail="Cuenta eliminada exitosamente")