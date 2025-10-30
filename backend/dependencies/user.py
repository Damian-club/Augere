from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from core.settings import settings
from models.user import User
from jose import jwt, JWTError
from core.db import get_db
from sqlalchemy.orm import Session
from uuid import UUID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/access")

# def get_current_user(
#     token: str = Depends(oauth2_scheme),
#     db: Session = Depends(get_db)
# ) -> User:
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="No se pudieron validar las credenciales",
#         headers={"WWW-Authenticate": "Bearer"},
#     )

#     try:
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

#         uuid_str: str = payload.get("uuid") or payload.get("sub")
#         if uuid_str is None:
#             raise credentials_exception

#         user_uuid = UUID(uuid_str)

#     except (JWTError, ValueError):
#         raise credentials_exception

#     user: User = db.query(User).filter(User.uuid == user_uuid).first()
#     if user is None:
#         raise credentials_exception

#     return user

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    print(f"🔍 Validando token (longitud: {len(token)} chars)")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodifica el token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"🔍 Payload keys: {list(payload.keys())}")
        
        # Busca "sub" primero (estándar JWT), luego "uuid"
        uuid_str: str = payload.get("sub") or payload.get("uuid")
        
        if uuid_str is None:
            print(f"❌ No se encontró 'sub' ni 'uuid' en payload: {payload}")
            raise credentials_exception
        
        print(f"🔍 UUID extraído: {uuid_str}")
        user_uuid = UUID(uuid_str)
        
    except (JWTError, ValueError) as e:
        print(f"❌ Error validando token: {type(e).__name__}: {str(e)}")
        raise credentials_exception
    
    # Busca el usuario
    user: User = db.query(User).filter(User.uuid == user_uuid).first()
    
    if user is None:
        print(f"❌ Usuario no encontrado: {user_uuid}")
        raise credentials_exception
    
    print(f"✅ Usuario autenticado: {user.email}")
    return user