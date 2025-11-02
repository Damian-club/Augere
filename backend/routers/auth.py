from fastapi import APIRouter, Depends
from schemas.user import UserLogin, UserRegister, UserOut, UserUpdate
from schemas.token import Token
from schemas.message import Message
from fastapi.security import OAuth2PasswordRequestForm
from core.db import get_db
from models.user import User
from dependencies.user import get_current_user

from services.auth import login as s_login
from services.auth import register as s_register
from services.auth import delete_account as s_delete_account
from services.auth import me as s_me
from services.auth import update_account as s_update_account

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", summary="Registrar un nuevo usuario", response_model=Token)
def register(user_register: UserRegister, db=Depends(get_db)):
    return s_register(user_register, db=db)


@router.post(
    "/access",
    summary="Login para Swagger (OAuth2PasswordRequestForm)",
    response_model=Token,
)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)
) -> Token:
    user_login: UserLogin = UserLogin(email=form_data.username, password=form_data.password)
    return s_login(user_login, db=db)


@router.post("/login", summary="Login normal con JSON", response_model=Token)
def login_for_access(user_login: UserLogin, db=Depends(get_db)) -> Token:
    return s_login(user_login, db=db)


@router.get("/me", summary="Usuario mio", response_model=UserOut)
def read_user_me(user: User = Depends(get_current_user)) -> UserOut:
    return s_me(user)


@router.put("/update", summary="Actualizar cuenta", response_model=UserOut)
def update_account(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> UserOut:
    return s_update_account(current_user, user_update=user_update, db=db)


@router.delete("/delete", summary="Eliminar cuenta", response_model=Message)
def delete_account(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
) -> Message:
    return s_delete_account(current_user, db=db)
