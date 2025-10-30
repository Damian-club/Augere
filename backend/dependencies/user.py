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
    print(f"Validando token: {token[:20]}..." if token else " Token vacío")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"Payload decodificado: {payload}")

        uuid_str: str = payload.get("uuid") or payload.get("sub")
        if uuid_str is None:
            print("No se encontró uuid en el payload")
            raise credentials_exception

        user_uuid = UUID(uuid_str)
        print(f"Buscando usuario con UUID: {user_uuid}")

    except (JWTError, ValueError) as e:
        print(f"Error decodificando token: {e}")
        raise credentials_exception

    user: User = db.query(User).filter(User.uuid == user_uuid).first()
    if user is None:
        print("Usuario no encontrado en la base de datos")
        raise credentials_exception

    print(f"Usuario autenticado: {user.email}")
    return user
