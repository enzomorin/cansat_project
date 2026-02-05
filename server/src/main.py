import uvicorn, os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from database import DataBase, Missions

DB_PATH: str = "server/database/missions.db"
routes_PATH = os.makedirs("server/database", exist_ok=True)
db: DataBase = DataBase(DB_PATH)

#--------------- FastAPI APP ---------------
app: FastAPI = FastAPI(debug=True, routes=routes_PATH)
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:8080"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

#--------------- ROUTES ---------------
@app.get("/db")
async def root(): return {"message": f"hello world"}

#--------------- METHODS ---------------
@app.get("/db/missions")
async def get_missions(): return db.get_all()

@app.post("/db/missions")
async def add_mission(missions: Missions):
    db.insert(missions)
    return {"statue": "ok"}

@app.put("/db/missions/{mission_id}")
async def update_mission(mission_id: int, missions: dict):
    success = db.update(mission_id, missions)
    if not success: raise HTTPException(status_code=404, detail="Mission not found")
    return {"success": True}

@app.delete("/db/missions/{mission_id}")
async def delete_mission(mission_id: int): return {"success": db.delete(mission_id)}


#--------------- RUN API REST ---------------
if __name__ == '__main__': uvicorn.run(__name__ + ":app", host = "127.0.0.1", port = 8000, reload=True)