from datetime import datetime, timedelta

from app.detection.baseline_engine import compute_baseline
from app.detection.deviation_engine import evaluate_event
from app.models.enums import BaselineType
from app.services.event_service import record_event


def _seed_normal_history(db, user, now, days=20, device="Work Laptop", location="New York, US"):
    for i in range(days):
        record_event(
            db, user_id=user.id, application="GMAIL", event_type="EMAIL_OPEN", action="EMAIL_OPEN",
            timestamp=now - timedelta(days=i + 3, hours=-10), device_name=device,
            location=location, resource_type="email_thread", resource_sensitivity="INTERNAL", commit=False,
        )
    db.commit()


def test_new_device_is_flagged(db, make_user):
    user = make_user()
    now = datetime.utcnow()
    _seed_normal_history(db, user, now)
    baseline = compute_baseline(db, user, BaselineType.LONG_TERM.value, now)

    event = record_event(
        db, user_id=user.id, application="GMAIL", event_type="LOGIN", action="LOGIN",
        timestamp=now, device_name="Unknown Laptop", location="New York, US", commit=True,
    )
    signals = evaluate_event(event, baseline)
    assert any(s.signal_type == "NEW_DEVICE" for s in signals)


def test_established_habit_is_not_flagged_as_sensitive_action(db, make_user):
    """An action a user performs regularly should never be labeled a rare,
    sensitive deviation just because it is a small share of their total
    activity - this is the core false-positive-control mechanism."""
    user = make_user(role="HR Manager")
    now = datetime.utcnow()
    for i in range(20):
        record_event(
            db, user_id=user.id, application="GMAIL", event_type="EMAIL_OPEN", action="EMAIL_OPEN",
            timestamp=now - timedelta(days=i + 3, hours=-10), device_name="Work Laptop",
            location="New York, US", commit=False,
        )
    for i in range(6):
        record_event(
            db, user_id=user.id, application="GMAIL", event_type="ATTACHMENT_DOWNLOAD",
            action="ATTACHMENT_DOWNLOAD", timestamp=now - timedelta(days=i * 3 + 3, hours=-10),
            device_name="Work Laptop", location="New York, US", resource_type="attachment",
            resource_sensitivity="CONFIDENTIAL", commit=False,
        )
    db.commit()
    baseline = compute_baseline(db, user, BaselineType.LONG_TERM.value, now)

    event = record_event(
        db, user_id=user.id, application="GMAIL", event_type="ATTACHMENT_DOWNLOAD",
        action="ATTACHMENT_DOWNLOAD", timestamp=now, device_name="Work Laptop",
        location="New York, US", resource_type="attachment", resource_sensitivity="CONFIDENTIAL", commit=True,
    )
    signals = evaluate_event(event, baseline)
    assert not any(s.signal_type == "SENSITIVE_ACTION" for s in signals)
    assert not any(s.signal_type == "UNUSUAL_SENSITIVE_RESOURCE" for s in signals)


def test_unfamiliar_action_is_flagged(db, make_user):
    user = make_user(role="Finance Analyst")
    now = datetime.utcnow()
    for i in range(15):
        record_event(
            db, user_id=user.id, application="FINANCE", event_type="ACCOUNT_VIEW", action="ACCOUNT_VIEW",
            timestamp=now - timedelta(days=i + 3, hours=-10), device_name="Work Laptop",
            location="New York, US", resource_type="account", resource_sensitivity="CONFIDENTIAL", commit=False,
        )
    db.commit()
    baseline = compute_baseline(db, user, BaselineType.LONG_TERM.value, now)

    event = record_event(
        db, user_id=user.id, application="FINANCE", event_type="TRANSFER_CREATE", action="TRANSFER_CREATE",
        timestamp=now, device_name="Work Laptop", location="New York, US",
        resource_type="transfer", resource_sensitivity="RESTRICTED", commit=True,
    )
    signals = evaluate_event(event, baseline)
    assert any(s.signal_type == "SENSITIVE_ACTION" for s in signals)
