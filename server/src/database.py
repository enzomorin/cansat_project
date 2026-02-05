from sqlmodel import create_engine, SQLModel, Session, select
from functools import wraps
from models import Missions

class DataBase:
    def __init__(self, path: str) -> None:
        self.engine = create_engine(f"sqlite:///{path}")
        SQLModel.metadata.create_all(self.engine)
        self.FORBIDDEN_FIELDS = {"id", "location", "mission_date"}     

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
    def get_all(self, session) -> list[Missions]:
        return session.exec(select(Missions)).all()
    
    @open_session(commit=False)
    def get_many(self, session, ids: list[int]) -> list[Missions]:
        list = select(Missions).where(Missions.id.in_(ids))
        return session.exec(list).all()
    
    @open_session(commit = False)
    def get(self, session, id: int) -> Missions | None:
        return session.get(Missions, id)
    
    @open_session()
    def insert(self, session, mission: Missions) -> Missions:
        session.add(mission)
        session.flush()
        session.refresh(mission)
        return mission
    
    @open_session()
    def update(self, session, id: int, data: dict) -> bool:
        mission = session.get(Missions, id)
        if not mission: return False

        for key, value in data.items():
            if key in self.FORBIDDEN_FIELDS:
                continue
            if hasattr(mission, key) and value is not None:
                setattr(mission, key, value)

        return True
    
    @open_session()
    def delete(self, session, id: int) -> bool:
        mission = session.get(Missions, id)
        if not mission: return False
        session.delete(mission)
        return True