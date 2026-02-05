import pandas as pd
from ..src.models import Missions

def load_csv(mission: Missions) -> pd.DataFrame:
    try:
        return pd.read_csv(mission.csv_path)
    except Exception as e:
        raise RuntimeError(f"Erreur lecture CSV mission {mission.id}: {e}")
    
def compare_missions(missions: list[Missions]) -> dict:
    result = {
        "missions": [],
        "comparison": {}
    }

    for mission in missions:
        df = load_csv(mission)

        result["missions"].append({
            "id": mission.id,
            "name": mission.name,
            "location": mission.location
        })

        result["comparison"][mission.name] = {
            "max_altitude": float(df["altitude_m"].max()),
            "mean_altitude": float(df["altitude_m"].mean()),
            "duration": float(df["time_s"].iloc[-1])
        }

    return result

TEST DE CHATGPT À REVOIR
