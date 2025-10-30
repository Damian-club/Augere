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
        print(f"Payload keys: {list(payload.keys())}")
        
        # Busca "sub" primero (estándar JWT), luego "uuid"
        uuid_str: str = payload.get("sub") or payload.get("uuid")
        
        if uuid_str is None:
            print(f"No se encontró 'sub' ni 'uuid' en payload: {payload}")
            raise credentials_exception
        
        print(f"UUID extraído: {uuid_str}")
        user_uuid = UUID(uuid_str)
        print(f"Buscando usuario con UUID: {user_uuid}")

    except (JWTError, ValueError) as e:
        print(f"Error decodificando token: {e}")
        raise credentials_exception
    
    # Busca el usuario
    user: User = db.query(User).filter(User.uuid == user_uuid).first()
    
    if user is None:
        print("Usuario no encontrado en la base de datos")
        raise credentials_exception

    print(f"Usuario autenticado: {user.email}")
    return user
