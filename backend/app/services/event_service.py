"""The single ingestion point every application (mock or real) uses to
report activity. This is deliberately the only place that writes to the
`events` table, so the unified event schema is enforced in one spot and the
detection engine never needs application-specific glue code.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.user import Device


def _get_or_create_device(db: Session, user_id: int, device_name: str, device_type: str,
                           timestamp: datetime) -> Device:
    device = (
        db.query(Device)
        .filter(Device.user_id == user_id, Device.device_name == device_name)
        .one_or_none()
    )
    if device is None:
        device = Device(
            user_id=user_id,
            device_name=device_name,
            device_type=device_type,
            first_seen=timestamp,
            is_known=False,
        )
        db.add(device)
        db.flush()
    return device


def record_event(
    db: Session,
    *,
    user_id: int,
    application: str,
    event_type: str,
    action: str,
    timestamp: Optional[datetime] = None,
    resource_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_sensitivity: str = "INTERNAL",
    device_name: Optional[str] = None,
    device_type: str = "desktop",
    ip_address: Optional[str] = None,
    location: Optional[str] = None,
    session_id: Optional[str] = None,
    data_volume: float = 0.0,
    metadata: Optional[dict] = None,
    project_id: Optional[int] = None,
    role_at_event: Optional[str] = None,
    simulation_run_id: Optional[int] = None,
    commit: bool = True,
) -> Event:
    ts = timestamp or datetime.utcnow()

    device = None
    if device_name:
        device = _get_or_create_device(db, user_id, device_name, device_type, ts)

    event = Event(
        timestamp=ts,
        user_id=user_id,
        application=application,
        event_type=event_type,
        action=action,
        resource_id=resource_id,
        resource_type=resource_type,
        resource_sensitivity=resource_sensitivity,
        device_id=device.id if device else None,
        device_label=device_name,
        ip_address=ip_address,
        location=location,
        session_id=session_id,
        data_volume=data_volume,
        metadata_json=metadata or {},
        project_id=project_id,
        role_at_event=role_at_event,
        simulation_run_id=simulation_run_id,
    )
    db.add(event)
    db.flush()
    if commit:
        db.commit()
        db.refresh(event)
    return event
