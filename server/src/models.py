from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

class Missions(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    csv_file: str | None = None
    original_csv_path: Optional[str] = None
    location: str
    radius: int | None = Field(default=500)
    mission_date: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )   # ^_send date into string
    duration: float | None = None
    is_deleted: bool = Field(default=False, index=True)

class MissionCreate(BaseModel):
    name: str
    location: str
    radius: Optional[int] = 500
    csv_content: str = None
    mission_date: Optional[datetime] = None
    duration: Optional[float] = None

class MissionUpdate(BaseModel):
    name: Optional[str] = None
    csv_content: Optional[str] = None
    location: Optional[str] = None
    radius: Optional[int] = None
    mission_date: Optional[datetime] = None
    duration: Optional[float] = None
