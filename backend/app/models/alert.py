from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import AlertStatus


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    risk_score: Mapped[float] = mapped_column()
    confidence: Mapped[float] = mapped_column()
    severity: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(30), default=AlertStatus.OPEN.value)
    behavioral_state: Mapped[str] = mapped_column(String(20))

    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text, default="")

    first_observed: Mapped[datetime] = mapped_column()
    last_observed: Mapped[datetime] = mapped_column()

    affected_applications: Mapped[list] = mapped_column(JSON, default=list)
    affected_resources: Mapped[list] = mapped_column(JSON, default=list)
    context_notes: Mapped[list] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column()
    updated_at: Mapped[datetime] = mapped_column()

    user: Mapped["User"] = relationship()
    evidence: Mapped[list["AlertEvidence"]] = relationship(back_populates="alert", cascade="all, delete-orphan")
    feedback: Mapped[list["AnalystFeedback"]] = relationship(back_populates="alert", cascade="all, delete-orphan")

    def to_dict(self, include_evidence=True):
        d = {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "role": self.user.role.name if self.user and self.user.role else None,
            "risk_score": round(self.risk_score, 1),
            "confidence": round(self.confidence, 1),
            "severity": self.severity,
            "status": self.status,
            "behavioral_state": self.behavioral_state,
            "title": self.title,
            "summary": self.summary,
            "first_observed": self.first_observed.isoformat(),
            "last_observed": self.last_observed.isoformat(),
            "affected_applications": self.affected_applications,
            "affected_resources": self.affected_resources,
            "context_notes": self.context_notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if include_evidence:
            d["evidence"] = [e.to_dict() for e in self.evidence]
            d["feedback"] = [f.to_dict() for f in self.feedback]
        return d


class AlertEvidence(Base):
    __tablename__ = "alert_evidence"

    id: Mapped[int] = mapped_column(primary_key=True)
    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id"))
    signal_type: Mapped[str] = mapped_column(String(60))
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20))
    deviation_score: Mapped[float] = mapped_column(default=0.0)
    application: Mapped[str | None] = mapped_column(String(30), nullable=True)
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id"), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column()

    alert: Mapped["Alert"] = relationship(back_populates="evidence")

    def to_dict(self):
        return {
            "id": self.id,
            "signal_type": self.signal_type,
            "description": self.description,
            "severity": self.severity,
            "deviation_score": round(self.deviation_score, 2),
            "application": self.application,
            "event_id": self.event_id,
            "occurred_at": self.occurred_at.isoformat(),
        }


class AnalystFeedback(Base):
    __tablename__ = "analyst_feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id"))
    feedback_type: Mapped[str] = mapped_column(String(30))
    notes: Mapped[str] = mapped_column(Text, default="")
    analyst_name: Mapped[str] = mapped_column(String(100), default="Security Analyst")
    created_at: Mapped[datetime] = mapped_column()

    alert: Mapped["Alert"] = relationship(back_populates="feedback")

    def to_dict(self):
        return {
            "id": self.id,
            "feedback_type": self.feedback_type,
            "notes": self.notes,
            "analyst_name": self.analyst_name,
            "created_at": self.created_at.isoformat(),
        }


from app.models.user import User  # noqa: E402
