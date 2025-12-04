if not __name__ == '__main__': quit()

import fastapi, uvicorn, sqlite3
from fastapi.middleware.cors import CORSMiddleware

app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

#async pour les fonction

@app.get("/")
async def home():
    return {"message": f"hello world"}

@app.get("/base/{items}")
async def get_data(items: str):
    return {"you_requested": items}

@app.put("/base/{items}")
async def save_data():
    pass
uvicorn.run(app, host = "127.0.0.1", port = 8000)