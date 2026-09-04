from datetime import datetime, timedelta

from app.detection.baseline_engine import compute_baseline
from app.models.enums import BaselineType
from app.services.event_service import record_event


def test_baseline_aggregates_devices_and_hours(db, make_user):
    user = make_user()
    now = datetime.utcnow().replace(hour=12, minute=0, second=0, microsecond=0)

    for i in range(10):
        record_event(
            db, user_id=user.id, application="GMAIL", event_type="LOGIN", action="LOGIN",
            timestamp=now - timedelta(days=i + 4, hours=-9), device_name="Work Laptop",
            location="New York, US", commit=False,
        )
    db.commit()

    baseline = compute_baseline(db, user, BaselineType.LONG_TERM.value, now)

    assert baseline.sample_size == 10
    assert "Work Laptop" in baseline.usual_devices
    assert baseline.usual_devices["Work Laptop"] == 10
    assert "New York, US" in baseline.usual_locations
    assert baseline.app_usage.get("GMAIL") == 10


def test_baseline_empty_window_has_zero_sample_size(db, make_user):
    user = make_user()
    baseline = compute_baseline(db, user, BaselineType.LONG_TERM.value, datetime.utcnow())
    assert baseline.sample_size == 0
