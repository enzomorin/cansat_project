if not __name__ == '__main__': quit()

import fastapi
import uvicorn

app = fastapi.FastAPI()

#async pour les fonction

@app.get("/")
def home():
    return None

uvicorn.run(app, host = "127.0.0.1", port = 8000)