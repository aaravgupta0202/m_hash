from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.baseline import BehavioralStateHistory
from app.models.enums import AlertStatus
from app.models.event import Event
from app.models.user import User

router = APIRouter(prefix="/api/overview", tags=["overview"])

OPEN_STATUSES = [AlertStatus.OPEN.value, AlertStatus.ACKNOWLEDGED.value]


@router.get("")
def get_overview(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    monitored_events = db.query(Event).count()

    open_alerts = db.query(Alert).filter(Alert.status.in_(OPEN_STATUSES)).all()
    active_alerts = len(open_alerts)

    risk_distribution = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for a in open_alerts:
        risk_distribution[a.severity] = risk_distribution.get(a.severity, 0) + 1

    high_risk_users = db.query(User).filter(User.current_state.in_(["SUSPICIOUS", "HIGH_RISK"])).count()
    behavioral_shifts = db.query(User).filter(User.current_state != "NORMAL").count()

    top_risk_users = (
        db.query(User)
        .order_by(User.current_risk_score.desc())
        .limit(8)
        .all()
    )

    since = datetime.utcnow() - timedelta(days=7)
    history_rows = (
        db.query(BehavioralStateHistory.timestamp, func.avg(BehavioralStateHistory.risk_score))
        .filter(BehavioralStateHistory.timestamp >= since)
        .group_by(func.date(BehavioralStateHistory.timestamp))
        .order_by(BehavioralStateHistory.timestamp)
        .all()
    )
    risk_trend = [{"date": ts.date().isoformat(), "avg_risk": round(avg, 1)} for ts, avg in history_rows]

    recent_alerts = (
        db.query(Alert)
        .order_by(Alert.updated_at.desc())
        .limit(6)
        .all()
    )

    return {
        "total_users": total_users,
        "monitored_events": monitored_events,
        "active_alerts": active_alerts,
        "high_risk_users": high_risk_users,
        "behavioral_shifts": behavioral_shifts,
        "risk_distribution": risk_distribution,
        "risk_trend": risk_trend,
        "top_risk_users": [u.to_summary_dict() for u in top_risk_users],
        "recent_shifts": [a.to_dict(include_evidence=False) for a in recent_alerts],
    }
