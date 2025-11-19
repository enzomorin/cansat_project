if not __name__ == '__main__': quit()

import fastapi, uvicorn, os
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware

app = fastapi.FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.mount(
    "/static", 
    StaticFiles(directory = os.path.join(BASE_DIR, "static")), 
    name = "static"
    )

templates = Jinja2Templates(
    directory = os.path.join(BASE_DIR, "templates")
    )

@app.get("/")
async def home():
    return RedirectResponse(url="/home")

@app.get("/home", response_class = HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

uvicorn.run(app, host = "127.0.0.1", port = 8080)