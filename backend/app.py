from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.db import Base, engine

from routers.auth import router as auth_router
from routers.course import router as course_router
from routers.student import router as student_router
from routers.schema import router as schema_router
from routers.schema_category import router as schema_category_router
from routers.schema_entry import router as schema_entry_router
from routers.ai_chat import router as ai_chat_router
from routers.assignment_data import router as assignment_data_router
from routers.progress import router as progress_router

from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def start(instance: FastAPI):
    Base.metadata.create_all(bind=engine)
    print(Base.metadata.tables.keys())
    yield


app = FastAPI(
    title="Backend de Augere",
    description="Descripcion",
    version="0.1.0",
    lifespan=start
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth_router)
app.include_router(course_router)
app.include_router(student_router)
app.include_router(schema_router)
app.include_router(schema_category_router)
app.include_router(schema_entry_router)
app.include_router(ai_chat_router)
app.include_router(progress_router)
app.include_router(assignment_data_router)
