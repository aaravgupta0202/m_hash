from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import BehavioralState


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(200), unique=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"))
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))

    # Declared "normal" working pattern used to seed the baseline before enough
    # history has accumulated, and to generate realistic activity.
    normal_start_hour: Mapped[int] = mapped_column(default=9)
    normal_end_hour: Mapped[int] = mapped_column(default=18)
    usual_locations: Mapped[list] = mapped_column(JSON, default=list)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")

    # Cached current behavioral snapshot, refreshed by the detection pipeline.
    # Kept denormalized on the user row so dashboard list views are a single query.
    current_risk_score: Mapped[float] = mapped_column(default=0.0)
    current_confidence: Mapped[float] = mapped_column(default=0.0)
    current_state: Mapped[str] = mapped_column(String(20), default=BehavioralState.NORMAL.value)
    state_updated_at: Mapped[datetime | None] = mapped_column(nullable=True)

    is_scenario_actor: Mapped[bool] = mapped_column(default=False)
    scenario_tag: Mapped[str | None] = mapped_column(String(64), nullable=True)

    role: Mapped["Role"] = relationship(back_populates="users")
    department: Mapped["Department"] = relationship(back_populates="users")
    devices: Mapped[list["Device"]] = relationship(back_populates="user")
    project_memberships: Mapped[list["ProjectMembership"]] = relationship(back_populates="user")

    def to_summary_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role.name if self.role else None,
            "department": self.department.name if self.department else None,
            "current_risk_score": round(self.current_risk_score, 1),
            "current_confidence": round(self.current_confidence, 1),
            "current_state": self.current_state,
            "state_updated_at": self.state_updated_at.isoformat() if self.state_updated_at else None,
            "is_scenario_actor": self.is_scenario_actor,
            "scenario_tag": self.scenario_tag,
        }


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    device_name: Mapped[str] = mapped_column(String(150))
    device_type: Mapped[str] = mapped_column(String(50), default="desktop")
    first_seen: Mapped[datetime] = mapped_column()
    is_known: Mapped[bool] = mapped_column(default=True)

    user: Mapped["User"] = relationship(back_populates="devices")


from app.models.org import Department, ProjectMembership, Role  # noqa: E402
