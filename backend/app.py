from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.db import Base, engine

from routers.auth import router as auth_router
from routers.course import router as course_router
from routers.student import router as student_router
from routers.schema import router as schema_router
from routers.schema_category import router as schema_category_router

from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def start(instance: FastAPI):
    # Iniciar
    Base.metadata.create_all(bind=engine)
    print(Base.metadata.tables.keys())
    yield
    # Cerrar

app = FastAPI(lifespan=start)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite
        "http://127.0.0.1:5173",
        "http://localhost:3000",  # Create React App
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def debug_middleware(request, call_next):
    print(f"🔍 Request: {request.method} {request.url}")
    print(f"🔍 Origin: {request.headers.get('origin')}")
    print(f"🔍 Authorization: {request.headers.get('authorization')}")
    
    response = await call_next(request)
    
    print(f"🔍 Response: {response.status_code}")
    print(f"🔍 CORS Headers: {dict(response.headers)}")
    
    return response

app.include_router(auth_router)
app.include_router(course_router)
app.include_router(student_router)
app.include_router(schema_router)
app.include_router(schema_category_router)