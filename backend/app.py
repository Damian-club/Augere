from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.db import Base, engine

from routers.user import user_router

@asynccontextmanager
async def start(instance: FastAPI):
    # Iniciar
    Base.metadata.create_all(bind=engine)
    print(Base.metadata.tables.keys())

    yield
    # Cerrar

app = FastAPI(lifespan=start)


app.include_router(user_router)

