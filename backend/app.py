from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.db import Base, engine

from routers.user import user_router
from routers.auth import router as auth_router
# Importar el middlewae para solucionar problemas de los CORS
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def start(instance: FastAPI):
    # Iniciar
    Base.metadata.create_all(bind=engine)
    print(Base.metadata.tables.keys())
    yield
    # Cerrar

app = FastAPI(lifespan=start)

# Configuración de los CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En desarrollo = *, en Produccion = URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router)
app.include_router(auth_router)
