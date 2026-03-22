from sqlmodel import create_engine, SQLModel, Session, select, desc
from functools import wraps
from models import Missions, MissionCreate, MissionUpdate
from services.csv import *

class DataBase:
    def __init__(self, path: str) -> None:
        self.engine = create_engine(f"sqlite:///{path}", echo=False)
        SQLModel.metadata.create_all(self.engine)
        self.FORBIDDEN_FIELDS = {"id", "mission_date"}     

    @staticmethod
    def open_session(commit: bool = True):
        def decorator(function):
            @wraps(function)
            def wrapper(self, *args, **kwargs):
                with Session(self.engine) as session:
                    try:
                        result = function(self, session, *args, **kwargs)
                        if commit: session.commit()
                        return result
                    except Exception:
                        session.rollback()
                        raise
            return wrapper
        return decorator

    @open_session(commit = False)
    def get_all(self, session, include_deleted: bool = False) -> list[Missions]:
        if include_deleted:
            query = select(Missions).where(Missions.is_deleted == True).order_by(desc(Missions.mission_date))
        else:
            query = select(Missions).where(Missions.is_deleted == False).order_by(desc(Missions.mission_date))

        return session.exec(query).all()
    
    @open_session(commit=False)
    def get_many(self, session, ids: list[int], include_deleted: bool = False) -> list[Missions]:
        query = select(Missions).where(Missions.id.in_(ids))
        if include_deleted:
            query = query.where(Missions.is_deleted == True).order_by(desc(Missions.mission_date))
        else:
            query = query.where(Missions.is_deleted == False).order_by(desc(Missions.mission_date))
        return session.exec(query).all()
    
    @open_session(commit = False)
    def get(self, session, id: int, include_deleted: bool = False) -> Missions | None:
        mission = session.get(Missions, id)
        if not mission or (mission.is_deleted and not include_deleted):
            return None
        return mission
    
    @open_session(commit=False)
    def get_csv(self, session, id: int) -> str | None:
        mission = session.get(Missions, id)

        if not mission:
            return None

        return read_csv(mission.csv_file)
    
    @open_session(commit=False)
    def get_csv_path(self, session, id: int) -> str | None:
        mission = session.get(Missions, id)
        if not mission:
            return None
        return get_csv_path(mission.csv_file)
    
    @open_session()
    def insert(self, session, mission: Missions, csv_content: str) -> bool:
        try:
            filename = write_csv(mission.name, csv_content)
            mission.csv_file = filename
            session.add(mission)

            return True
        except Exception:
            return False
    
    @open_session()
    def update(self, session, id: int, data: dict) -> bool:
        mission = session.get(Missions, id)
        if not mission: return False

        if "csv_content" in data and data["csv_content"] is not None:
            delete_file(mission.csv_file)
            filename = write_csv(
                data.get("name", mission.name),
                data["csv_content"]
            )
            mission.csv_file = filename

        for key, value in data.items():
            if key in self.FORBIDDEN_FIELDS:
                continue
            if hasattr(mission, key):
                setattr(mission, key, value)

        return True
    
    @open_session()
    def soft_delete(self, session, id: int) -> bool:
        mission = session.get(Missions, id)
        if not mission: return False
        move_to_trash(mission.csv_file)
        mission.is_deleted = True
        return True
    
    @open_session()
    def restore(self, session, id: int) -> bool:
        mission = session.get(Missions, id)
        if not mission or not mission.is_deleted: return False
        restore_from_trash(mission.csv_file)
        mission.is_deleted = False
        return True
    
    @open_session()
    def delete(self, session, id: int) -> bool:
        mission = session.get(Missions, id)
        if not mission: return False
        delete_file(mission.csv_file)
        session.delete(mission)
        return True
