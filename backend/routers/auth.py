from fastapi import APIRouter, Depends
from schemas.user import UserRegister
from schemas.user import UserLogin, UserRegister, UserOut
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import HTTPException
from core.db import get_db
from dependencies.user import get_current_user

from services.auth import login as s_login, register as s_register, delete_account as s_delete_account

router = APIRouter(prefix='/auth', tags=['Auth'])

@router.post("/register", summary="Register a new user")
def register(
    data: UserRegister,
    db = Depends(get_db)
):
    try:
        response = s_register(data, db)
        return response
    except Exception as e:
        raise HTTPException(400, f"Error al registrarse: {e}")

@router.post("/access", summary="Login para Swagger (OAuth2PasswordRequestForm)")
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

@router.post("/login", summary="Login normal con JSON")
def login_for_access(
    user_login: UserLogin,
    db = Depends(get_db)
):
    try:
        return s_login(user_login, db)
    except Exception as e:
        raise HTTPException(400, f"Error login: {e}")

@router.get("/me", summary="Usuario mio")
def read_user_me(user: UserOut = Depends(get_current_user)):
    try:
        return user
    except Exception as e:
        raise HTTPException(400, f"Error al obtener usuario: {e}")

@router.delete("/delete", summary="Eliminar cuenta")
def delete_account(
    db = Depends(get_db),
    current_user: UserOut = Depends(get_current_user)
):
    try:
        return s_delete_account(db, current_user)
    except Exception as e:
        raise HTTPException(400, f"Error al eliminar cuenta: {e}")