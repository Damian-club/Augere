from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from core.settings import settings
from models.user import User
from schemas.user import UserOut
from jose import jwt, JWTError
from core.db import get_db
from sqlalchemy.orm import Session
from uuid import UUID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/access")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserOut:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        uuid: str = payload.get("uuid")
        if uuid is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_uuid = UUID(uuid)
    user: User = db.query(User).filter(User.uuid == user_uuid).first()
    if user is None:
        raise credentials_exception
    
    user_out = UserOut(
        name=user.name,
        email=user.email,
        avatar_path=user.avatar_path,
        uuid=user.uuid,
        creation_date=user.creation_date
    )

    return user_out