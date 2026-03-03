import uvicorn, os
from fastapi import FastAPI, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from database import DataBase, Missions, MissionCreate, MissionUpdate

DB_PATH: str = "server/database/missions.db"
os.makedirs("server/database", exist_ok=True)
DB_KEY: str = "AZE"
db: DataBase = DataBase(DB_PATH)

#--------------- FastAPI APP ---------------
app: FastAPI = FastAPI(debug=True)
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:8080", "file://"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

def check_key(key: str | None): 
    if key != DB_KEY: return { "success": False, "data": "Unauthorized"}
    return None

def secure(key: str | None): return key == DB_KEY

#--------------- ROUTES ---------------
@app.get("/db")
async def root(x_api_key: str | None = Header(None)):
    if not secure(x_api_key):
        return check_key(x_api_key)
    
    return {
        "success": True,
        "data": f"Hello World"
    }

#--------------- METHODS ---------------
@app.get("/db/missions")
async def get_missions(
    id: int | None = None, 
    ids: list | None = Query(default=None),
    include_deleted: bool = False,
    x_api_key: str | None = Header(None)
):
    if not secure(x_api_key):
        return check_key(x_api_key)
    
    data = None
    # 1 mission = GET
    if id is not None: 
        mission = db.get(id, include_deleted=include_deleted)
        if mission: data = [mission] if mission else None

    # many missions not all = GET_MANY
    elif ids is not None: data = db.get_many(ids, include_deleted=include_deleted)

    # no id or ids so all missions = GET_ALL
    else: data = db.get_all(include_deleted=include_deleted)

    # when no data means mission not found
    if not data: return {"success": False, "data": "Mission not found"}

    return {
        "success": True,
        "data": jsonable_encoder(data)
    }

@app.get("/db/missions/csv")
async def get_csv(id: int, x_api_key: str | None = Header(None)):
    if not secure(x_api_key):
        return check_key(x_api_key)
    csv = db.get_csv(id)

    if csv is None: return {"success": False, "data": "Not found"}
    return {
        "success": True,
        "data": csv
    }

@app.post("/db/missions")
async def add_mission(mission: MissionCreate | None = None, x_api_key: str | None = Header(None)):
    if not secure(x_api_key):
        return check_key(x_api_key)
    if not mission: return {"success": False}
    
    data = mission.model_dump(exclude={"csv_content"})
    csv = mission.csv_content

    mission = Missions(**data)
    success = db.insert(mission, csv)
    if not success: return {"success": False}
    return {"success": success}

@app.put("/db/missions")
async def update_mission(id: int | None = None, mission: MissionUpdate | None = None, x_api_key: str | None = Header(None)):
    if not secure(x_api_key):
        return check_key(x_api_key)
    
    data = mission.model_dump(exclude_unset=True)

    success = db.update(id, data)
    return {
        "success": success,
        "data": "Mission updated successfully"
    }

@app.put("/db/missions/soft-delete")
async def soft_delete_mission(id: int, x_api_key: str | None = Header(None)):
    if not secure(x_api_key):
        return check_key(x_api_key)
    
    success = db.soft_delete(id)
    if not success: return {"success": False, "data": "Mission not found"}

    return {
        "success": success,
        "data": "Mission moved to trash"
    }

@app.put("/db/missions/restore")
async def restore_mission(id: int, x_api_key: str | None = Header(None)):
    if not secure(x_api_key):
        return check_key(x_api_key)
    
    success = db.restore(id)
    if not success:return {"success": False, "data": "Mission not found"}

    return {
        "success": success,
        "data": "Mission restored"
    }

@app.delete("/db/missions")
async def delete_mission(id: int | None = None, x_api_key: str | None = Header(None)):
    if not secure(x_api_key):
        return check_key(x_api_key)

    if not id: return {"success": False}
    success = db.delete(id)
    if not success: return {"success": False, "data": "Mission not found"}
    return {
        "success": success,
        "data": "mission deleted successfully"
    }


#--------------- RUN API REST ---------------
if __name__ == '__main__': uvicorn.run(__name__ + ":app", host = "127.0.0.1", port = 8000, reload=True)
