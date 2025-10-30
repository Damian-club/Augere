from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
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
    Base.metadata.create_all(bind=engine)
    print(Base.metadata.tables.keys())
    yield

app = FastAPI(lifespan=start)

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

# ===== AGREGA ESTOS MANEJADORES DE EXCEPCIONES =====

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Maneja excepciones HTTP y agrega headers CORS"""
    origin = request.headers.get("origin", "*")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Maneja errores de validación (400) y agrega headers CORS"""
    origin = request.headers.get("origin", "*")
    
    return JSONResponse(
        status_code=400,
        content={"detail": "Error de validación", "errors": exc.errors()},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Maneja cualquier otra excepción y agrega headers CORS"""
    origin = request.headers.get("origin", "*")
    
    print(f"❌ Excepción no manejada: {type(exc).__name__}: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

# ===== FIN DE LOS MANEJADORES =====

@app.middleware("http")
async def debug_middleware(request, call_next):
    print(f"🔍 Request: {request.method} {request.url}")
    print(f"🔍 Origin: {request.headers.get('origin')}")
    print(f"🔍 Authorization: {request.headers.get('authorization')}")
    
    response = await call_next(request)
    
    print(f"🔍 Response: {response.status_code}")
    print(f"🔍 CORS Headers: {dict(response.headers)}")
    
    return response

# Routers
app.include_router(auth_router)
app.include_router(course_router)
app.include_router(student_router)
app.include_router(schema_router)
app.include_router(schema_category_router)