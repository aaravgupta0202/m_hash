from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.detection.annotate import label_for_event
from app.detection.baseline_engine import compute_baseline
from app.detection.pipeline import run_pipeline_for_user
from app.models.baseline import BehavioralStateHistory
from app.models.context import ContextEvent
from app.models.enums import BaselineType
from app.models.event import Event
from app.models.user import Device, User

router = APIRouter(prefix="/api/users", tags=["users"])


def _baseline_dict(baseline):
    if baseline is None:
        return None
    return {
        "baseline_type": baseline.baseline_type,
        "computed_at": baseline.computed_at.isoformat(),
        "window_start": baseline.window_start.isoformat(),
        "window_end": baseline.window_end.isoformat(),
        "normal_hour_start": round(baseline.normal_hour_start, 1),
        "normal_hour_end": round(baseline.normal_hour_end, 1),
        "hour_histogram": baseline.hour_histogram,
        "usual_locations": baseline.usual_locations,
        "usual_devices": baseline.usual_devices,
        "app_usage": baseline.app_usage,
        "resource_categories": baseline.resource_categories,
        "action_frequencies": baseline.action_frequencies,
        "avg_events_per_day": round(baseline.avg_events_per_day, 1),
        "avg_data_volume_per_day": round(baseline.avg_data_volume_per_day, 1),
        "sample_size": baseline.sample_size,
    }


@router.get("")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.current_risk_score.desc()).all()
    return [u.to_summary_dict() for u in users]


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    devices = db.query(Device).filter(Device.user_id == user_id).all()
    contexts = db.query(ContextEvent).filter(ContextEvent.user_id == user_id).all()
    memberships = user.project_memberships

    d = user.to_summary_dict()
    d.update({
        "normal_start_hour": user.normal_start_hour,
        "normal_end_hour": user.normal_end_hour,
        "usual_locations": user.usual_locations,
        "devices": [
            {"id": dev.id, "name": dev.device_name, "type": dev.device_type,
             "first_seen": dev.first_seen.isoformat(), "is_known": dev.is_known}
            for dev in devices
        ],
        "projects": [
            {"name": m.project.name, "assigned_at": m.assigned_at.isoformat()} for m in memberships
        ],
        "context_events": [
            {"id": c.id, "context_type": c.context_type, "description": c.description,
             "start_date": c.start_date.isoformat(), "end_date": c.end_date.isoformat() if c.end_date else None}
            for c in contexts
        ],
    })
    return d


@router.get("/{user_id}/history")
def get_history(user_id: int, days: int = Query(14, ge=1, le=90), db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    window_start = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(BehavioralStateHistory)
        .filter(BehavioralStateHistory.user_id == user_id, BehavioralStateHistory.timestamp >= window_start)
        .order_by(BehavioralStateHistory.timestamp)
        .all()
    )
    return [
        {"timestamp": r.timestamp.isoformat(), "state": r.state, "risk_score": round(r.risk_score, 1),
         "confidence": round(r.confidence, 1)}
        for r in rows
    ]


@router.get("/{user_id}/baseline")
def get_baseline(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    now = datetime.utcnow()
    long_term = compute_baseline(db, user, BaselineType.LONG_TERM.value, now)
    recent = compute_baseline(db, user, BaselineType.RECENT.value, now)
    db.rollback()  # read-only endpoint: compute_baseline upserts, don't persist a side-effecting write on GET
    return {"long_term": _baseline_dict(long_term), "recent": _baseline_dict(recent)}


@router.get("/{user_id}/risk")
def get_risk(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    now = datetime.utcnow()
    result = run_pipeline_for_user(db, user, now, persist_history=False)
    db.rollback()

    return {
        "user_id": user.id,
        "as_of": result.as_of.isoformat(),
        "risk_score": round(result.risk_score, 1),
        "confidence": round(result.confidence, 1),
        "behavioral_state": result.behavioral_state,
        "explanation": result.explanation,
        "context_notes": result.context_notes,
        "correlation": {
            "distinct_signal_types": result.correlation.distinct_signal_types,
            "distinct_applications": result.correlation.distinct_applications,
            "span_days": round(result.correlation.span_days, 2),
            "cross_app_bonus": result.correlation.cross_app_bonus,
            "burst_bonus": result.correlation.burst_bonus,
            "persistence_bonus": round(result.correlation.persistence_bonus, 1),
        },
        "signals": [
            {
                "signal_type": s.signal_type, "severity": s.severity, "reason": s.reason,
                "application": s.application, "raw_score": round(s.score, 2),
                "effective_score": round(s.effective_score(), 2), "contextualized": s.contextualized,
                "context_note": s.context_note,
            }
            for s in result.signals
        ],
    }


@router.get("/{user_id}/timeline")
def get_timeline(
    user_id: int,
    application: str | None = Query(None),
    event_type: str | None = Query(None),
    severity: str | None = Query(None),
    days: int = Query(30, ge=1, le=90),
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    now = datetime.utcnow()
    window_start = now - timedelta(days=days)
    baseline = compute_baseline(db, user, BaselineType.LONG_TERM.value, now)
    db.rollback()

    stmt = (
        select(Event)
        .where(Event.user_id == user_id, Event.timestamp >= window_start)
        .order_by(Event.timestamp.desc())
        .limit(limit)
    )
    if application:
        stmt = stmt.where(Event.application == application)
    if event_type:
        stmt = stmt.where(Event.event_type == event_type)

    events = list(db.scalars(stmt))

    results = []
    for e in events:
        annotation = label_for_event(db, user_id, e, baseline)
        if severity and annotation["label"] != severity:
            continue
        item = e.to_dict()
        item["label"] = annotation["label"]
        item["signal_reasons"] = annotation["signals"]
        results.append(item)

    db.rollback()
    return results
