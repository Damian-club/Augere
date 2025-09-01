from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import HTTPException

from starlette import status

import os

app = FastAPI()

build_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))

i: int = 0

@app.get('/hello')
async def lol():
    global i
    i += 1
    return {
        "counter": i
    }

app.mount(
    "/static",
    StaticFiles(directory=build_path),
    name="static"
)

@app.get('/')
async def serve():
    index = os.path.join(build_path, "index.html")
    if os.path.exists(index):
        return FileResponse(index)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Not found index.html"
    )