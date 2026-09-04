from datetime import datetime

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.enums import SimulationStatus


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    scenario_name: Mapped[str] = mapped_column(String(60))
    status: Mapped[str] = mapped_column(String(20), default=SimulationStatus.PENDING.value)
    started_at: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    config: Mapped[dict] = mapped_column(JSON, default=dict)
    total_events: Mapped[int] = mapped_column(default=0)
    events_emitted: Mapped[int] = mapped_column(default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "scenario_name": self.scenario_name,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "total_events": self.total_events,
            "events_emitted": self.events_emitted,
        }
