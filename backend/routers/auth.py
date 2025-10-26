from fastapi import APIRouter, Depends
from schemas.user import UserLogin, UserRegister, UserOut
from schemas.token import Token
from schemas.message import Message
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import HTTPException
from core.db import get_db
from models.user import User
from dependencies.user import get_current_user

from services.auth import login as s_login
from services.auth import register as s_register
from services.auth import delete_account as s_delete_account
from services.auth import me as s_me

router = APIRouter(prefix='/auth', tags=['Auth'])

@router.post("/register", summary="Registrar un nuevo usuario", response_model=Token)
def register(
    data: UserRegister,
    db = Depends(get_db)
):
    try:
        response = s_register(data, db)
        return response
    except Exception as e:
        raise HTTPException(400, f"Error al registrarse: {e}")

@router.post("/access", summary="Login para Swagger (OAuth2PasswordRequestForm)", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
):
    try:
        user_login = UserLogin(
            email=form_data.username,
            password=form_data.password
        )
        return s_login(user_login, db)
    except Exception as e:
        raise HTTPException(400, f"Error al logearse: {e}")

@router.post("/login", summary="Login normal con JSON", response_model=Token)
def login_for_access(
    user_login: UserLogin,
    db = Depends(get_db)
):
    try:
        return s_login(user_login, db)
    except Exception as e:
        raise HTTPException(400, f"Error al logearse: {e}")

@router.get("/me", summary="Usuario mio", response_model=UserOut)
def read_user_me(user: User = Depends(get_current_user)):
    try:
        return s_me(user)
    except Exception as e:
        raise HTTPException(400, f"Error al obtener usuario: {e}")

@router.delete("/delete", summary="Eliminar cuenta", response_model=Message)
def delete_account(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    try:
        return s_delete_account(current_user, db)
    except Exception as e:
        raise HTTPException(400, f"Error al eliminar cuenta: {e}")