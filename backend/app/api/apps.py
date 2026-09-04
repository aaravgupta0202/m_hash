"""The bridge between the three mock applications and the unified event
pipeline. Every meaningful click in Social/Gmail/Finance ends up here - this
is the ONE place (besides the seed/simulation generators) that calls
event_service.record_event, which is exactly the point: the security engine
never contains Gmail-specific or Instagram-specific code.
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.enums import Application
from app.models.user import User
from app.schemas.requests import AppEventRequest
from app.services.detection_runner import recompute_user_state
from app.services.event_service import record_event

router = APIRouter(prefix="/api/apps", tags=["mock-apps"])

VALID_APPS = {a.value for a in Application if a != Application.SECURITY_CENTER}


@router.post("/{application}/event")
def record_app_event(application: str, body: AppEventRequest, db: Session = Depends(get_db)):
    app_name = application.upper()
    if app_name not in VALID_APPS:
        raise HTTPException(400, f"Unknown application '{application}'. Must be one of {sorted(VALID_APPS)}")

    user = db.get(User, body.user_id)
    if not user:
        raise HTTPException(404, "User not found")

    event = record_event(
        db,
        user_id=user.id,
        application=app_name,
        event_type=body.event_type,
        action=body.action,
        timestamp=datetime.utcnow(),
        resource_id=body.resource_id,
        resource_type=body.resource_type,
        resource_sensitivity=body.resource_sensitivity,
        device_name=body.device_name,
        location=body.location,
        data_volume=body.data_volume,
        metadata=body.metadata,
        role_at_event=user.role.name if user.role else None,
        commit=True,
    )

    result = recompute_user_state(db, user, datetime.utcnow(), persist_history=False,
                                   update_current=True, commit=True)

    return {
        "event": event.to_dict(),
        "risk_score": round(result.risk_score, 1),
        "confidence": round(result.confidence, 1),
        "behavioral_state": result.behavioral_state,
    }
