import uvicorn, aiohttp, os
from quart import Quart, render_template, request, redirect

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
template_path = os.path.join(BASE_DIR, "templates")
static_path = os.path.join(BASE_DIR, "static")
API_URL = "http://127.0.0.1:8000"

#--------------- QUART APP ---------------
app: Quart = Quart(
    __name__, 
    template_folder=template_path, 
    static_folder=static_path
)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
app.jinja_env.auto_reload = True

#--------------- GLOBAL ---------------
@app.before_serving
async def startup():
    app.http = aiohttp.ClientSession()

@app.after_serving
async def shutdown():
    await app.http.close()

#--------------- ROUTES ---------------
@app.route('/')
async def home():
    missions = []
    api_online = True

    try:
        async with app.http.get(f"{API_URL}/db/missions") as resp:
            missions = await resp.json()

    except Exception as e:
        print("API OFFLINE:", e)
        missions = []
        api_online = False

    return await render_template("pages/home.html", missions=missions, api_online=api_online, name = "0b1001101")

@app.route('/edit/<int:mission_id>')
async def edit(mission_id):
    async with aiohttp.ClientSession() as session:
        async with app.http.get(f"{API_URL}/db/missions") as resp: all_missions = await resp.json()

    mission = next((m for m in all_missions if m["id"] == mission_id), None)

    return await render_template("pages/edit_mission.html", mission=mission, api_online=True)


#--------------- METHOD ---------------
@app.route("/db/add", methods=["POST"])
async def add_mission():
        form = await request.form
        data = {
            "name": form.get("name"),
            "csv_path": form.get("csv_path"),
            "location": form.get("location"),
        }
        async with app.http.post(f"{API_URL}/db/missions", json=data, timeout=3) as resp:
            if resp.status != 200:
                return "Impossible d'ajouter de mission — API offline", 500

        return redirect("/")

@app.route("/db/edit/<int:mission_id>", methods=["POST"])
async def edit_mission(mission_id):
    form = await request.form
    data = {
        "name": form.get("name"),
        "csv_path": form.get("csv_path"),
        "location": form.get("location"),
    }

    async with app.http.put(f"{API_URL}/db/missions/{mission_id}", json=data, timeout=3) as rep:
        if rep.status != 200:
            return "Impossible de modifier la mission — API offline", 500

    return redirect("/")

@app.route("/db/delete/<int:mission_id>", methods=["GET"])
async def delete_mission(mission_id):
    async with app.http.delete(f"{API_URL}/db/missions/{mission_id}", timeout=3) as resp:
        if resp.status != 200:
            return "Impossible de supprimer de mission — API offline", 500
        
    return redirect("/")


#--------------- ERROR ---------------
async def error_handler(error_code: int, error_name: str, error_description: str):
    error_data: list = [error_code, error_name, error_description]
    return await render_template('special/error.html', error_info=error_data)

@app.errorhandler(404)
async def page_not_found(error):
    return await error_handler(404, "404 Not Found", "The page you are looking for does not exist")


#--------------- RUN API ---------------
if __name__ == '__main__': uvicorn.run(__name__ + ":app", host = "0.0.0.0", port = 8080, reload=True)