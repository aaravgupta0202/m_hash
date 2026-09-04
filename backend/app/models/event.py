from datetime import datetime

from sqlalchemy import JSON, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Event(Base):
    """The unified behavioral event.

    Every mock application (Social, Gmail, Finance) - and in principle any
    future application - emits events in exactly this shape via
    app.services.event_service.record_event. The detection engine only ever
    reads from this table; it has no awareness of which application produced
    a given row.
    """

    __tablename__ = "events"
    __table_args__ = (
        Index("ix_events_user_timestamp", "user_id", "timestamp"),
        Index("ix_events_application", "application"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    application: Mapped[str] = mapped_column(String(30))
    event_type: Mapped[str] = mapped_column(String(60))
    action: Mapped[str] = mapped_column(String(60))

    resource_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    resource_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    resource_sensitivity: Mapped[str] = mapped_column(String(20), default="INTERNAL")

    device_id: Mapped[int | None] = mapped_column(ForeignKey("devices.id"), nullable=True)
    device_label: Mapped[str | None] = mapped_column(String(150), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    session_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    data_volume: Mapped[float] = mapped_column(default=0.0)  # KB, unified across app types
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)

    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    role_at_event: Mapped[str | None] = mapped_column(String(100), nullable=True)

    simulation_run_id: Mapped[int | None] = mapped_column(ForeignKey("simulation_runs.id"), nullable=True)

    user: Mapped["User"] = relationship()

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "application": self.application,
            "event_type": self.event_type,
            "action": self.action,
            "resource_id": self.resource_id,
            "resource_type": self.resource_type,
            "resource_sensitivity": self.resource_sensitivity,
            "device_label": self.device_label,
            "ip_address": self.ip_address,
            "location": self.location,
            "session_id": self.session_id,
            "data_volume": self.data_volume,
            "metadata": self.metadata_json,
            "project_id": self.project_id,
        }


from app.models.user import User  # noqa: E402
