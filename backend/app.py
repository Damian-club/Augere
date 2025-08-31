from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import HTTPException
import os

app = FastAPI()

build_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(build_path, ".")),
    name="static"
)

@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    index_file = os.path.join(build_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Couln't locate index.html")