from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("")
def list_events(
    user_id: int | None = Query(None),
    application: str | None = Query(None),
    event_type: str | None = Query(None),
    days: int = Query(7, ge=1, le=90),
    limit: int = Query(200, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    window_start = datetime.utcnow() - timedelta(days=days)
    stmt = select(Event).where(Event.timestamp >= window_start).order_by(Event.timestamp.desc()).limit(limit)
    if user_id:
        stmt = stmt.where(Event.user_id == user_id)
    if application:
        stmt = stmt.where(Event.application == application)
    if event_type:
        stmt = stmt.where(Event.event_type == event_type)
    events = list(db.scalars(stmt))
    return [e.to_dict() for e in events]


@router.get("/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(404, "Event not found")
    return event.to_dict()
