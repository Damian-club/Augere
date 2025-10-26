from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.db import Base, engine

from routers.user import user_router
from routers.auth import router as auth_router
from routers.course import router as course_router

@asynccontextmanager
async def start(instance: FastAPI):
    # Iniciar
    Base.metadata.create_all(bind=engine)
    print(Base.metadata.tables.keys())
    yield
    # Cerrar

app = FastAPI(lifespan=start)


app.include_router(user_router)
app.include_router(auth_router)
app.include_router(course_router)