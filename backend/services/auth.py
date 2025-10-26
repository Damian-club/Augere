from util.auth import verify_password, get_password_hash, create_access_token
from schemas.user import UserLogin, UserRegister, UserOut
from schemas.message import Message
from models.user import User
from fastapi import  HTTPException
from datetime import timedelta
from core.settings import settings
from sqlalchemy.orm import Session
from schemas.token import Token

def login(data: UserLogin, db: Session):
        try:
            user: User = db.query(User).filter(User.email == data.email).first()
            if not user or not verify_password(data.password, user.pwd_hash):
                raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")
            return create_token(user)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

def register(data: UserRegister, db: Session):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuario ya existente")
    
    hashed_password = get_password_hash(data.password)

    user = User(
        name=data.name,
        email=data.email,
        pwd_hash=hashed_password,
        avatar_path=data.avatar_path
    )

    
    db.add(user)
    db.commit()
    
    return create_token(user)

def create_token(user: User):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
             "name": user.name,
             "email": user.email,
             "uuid": str(user.uuid),
             "avatar_path": user.avatar_path
            },
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

def delete_account(
    db: Session,
    current_user: UserOut
):
    user: User = db.query(User).filter(User.uuid == current_user.uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(user)
    db.commit()
    
    return Message(detail="Cuenta eliminada exitosamente")