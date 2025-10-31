from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from core.settings import settings
from models.user import User
from jose import jwt, JWTError
from core.db import get_db
from sqlalchemy.orm import Session
from uuid import UUID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/access")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodifica el token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Busca "sub" primero (estándar JWT), luego "uuid"
        uuid_str: str = payload.get("sub") or payload.get("uuid")
        
        if uuid_str is None:
            raise credentials_exception
        
        user_uuid = UUID(uuid_str)

    except (JWTError, ValueError) as e:
        raise credentials_exception
    
    # Busca el usuario
    user: User = db.query(User).filter(User.uuid == user_uuid).first()
    
    if user is None:
        raise credentials_exception

    return user
