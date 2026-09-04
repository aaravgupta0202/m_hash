from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ContextEvent(Base):
    """A legitimate organizational fact that can explain otherwise-unusual
    behavior: a project assignment, approved travel, a newly approved device,
    temporary elevated access, or scheduled maintenance.

    The context engine looks these up for a user/time window and uses them to
    discount deviation signals that the fact plausibly explains.
    """

    __tablename__ = "context_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    context_type: Mapped[str] = mapped_column(String(40))
    description: Mapped[str] = mapped_column(Text, default="")
    start_date: Mapped[datetime] = mapped_column()
    end_date: Mapped[datetime | None] = mapped_column(nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)

    user: Mapped["User"] = relationship()


from app.models.user import User  # noqa: E402
