if not __name__ == '__main__': quit()

import fastapi
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = fastapi.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True
)

#async pour les fonction

@app.get("/")
def home():
    return {"message":"hello world"}

@app.get("/base/{items}")
def get_data():
    pass

@app.put("/base/{items}")
def save_data():
    pass

uvicorn.run(app, host = "127.0.0.1", port = 8000)