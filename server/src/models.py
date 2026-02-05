from sqlmodel import SQLModel, Field
from datetime import datetime, timezone

class Missions(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    csv_path: str
    location: str
    mission_date: str | None = Field(
        default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    )   # ^_send date into string
    duration: float | None
    max_altitude: float | None
        # ^_found in the csv_file