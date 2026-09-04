from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Baseline(Base):
    """A computed snapshot of 'normal' for a user.

    Two rows per user are maintained: LONG_TERM (a wide historical window,
    slow to change) and RECENT (a short rolling window). Comparing the two is
    the simple 'adaptive baseline' mechanism used to notice that a user's
    behavior has meaningfully shifted, without over-engineering a full online
    learning system.
    """

    __tablename__ = "baselines"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    baseline_type: Mapped[str] = mapped_column(String(20))
    computed_at: Mapped[datetime] = mapped_column()
    window_start: Mapped[datetime] = mapped_column()
    window_end: Mapped[datetime] = mapped_column()

    normal_hour_start: Mapped[float] = mapped_column(default=9.0)
    normal_hour_end: Mapped[float] = mapped_column(default=18.0)
    hour_histogram: Mapped[list] = mapped_column(JSON, default=list)  # 24 buckets

    usual_locations: Mapped[dict] = mapped_column(JSON, default=dict)  # location -> frequency
    usual_devices: Mapped[dict] = mapped_column(JSON, default=dict)  # device_id -> frequency
    app_usage: Mapped[dict] = mapped_column(JSON, default=dict)  # application -> event count
    resource_categories: Mapped[dict] = mapped_column(JSON, default=dict)  # resource_type -> count
    action_frequencies: Mapped[dict] = mapped_column(JSON, default=dict)  # action -> count

    avg_events_per_day: Mapped[float] = mapped_column(default=0.0)
    std_events_per_day: Mapped[float] = mapped_column(default=0.0)
    avg_data_volume_per_day: Mapped[float] = mapped_column(default=0.0)
    std_data_volume_per_day: Mapped[float] = mapped_column(default=0.0)

    sample_size: Mapped[int] = mapped_column(default=0)

    user: Mapped["User"] = relationship()


class BehavioralStateHistory(Base):
    """Time series of a user's computed state/risk, used to draw trend lines
    and the NORMAL -> DRIFT -> SUSPICIOUS -> HIGH_RISK trajectory."""

    __tablename__ = "behavioral_state_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    timestamp: Mapped[datetime] = mapped_column()
    state: Mapped[str] = mapped_column(String(20))
    risk_score: Mapped[float] = mapped_column()
    confidence: Mapped[float] = mapped_column()

    user: Mapped["User"] = relationship()


from app.models.user import User  # noqa: E402
