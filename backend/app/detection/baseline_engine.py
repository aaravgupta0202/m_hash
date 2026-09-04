"""Computes a user's behavioral baseline from historical events.

Two baselines are maintained per user (see app.models.baseline.Baseline):
LONG_TERM (a wide, slow-moving window) and RECENT (a short rolling window).
Nothing here is application-specific - it operates purely on the unified
Event schema.
"""
from collections import Counter
from datetime import datetime, timedelta

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.detection.config import (
    BASELINE_LONG_TERM_DAYS,
    BASELINE_LONG_TERM_EXCLUDE_RECENT_DAYS,
    BASELINE_RECENT_DAYS,
)
from app.models.baseline import Baseline
from app.models.enums import BaselineType
from app.models.event import Event
from app.models.user import User


def _events_in_window(db: Session, user_id: int, start: datetime, end: datetime) -> list[Event]:
    stmt = (
        select(Event)
        .where(Event.user_id == user_id, Event.timestamp >= start, Event.timestamp < end)
        .order_by(Event.timestamp)
    )
    return list(db.scalars(stmt))


def _per_day_counts(events: list[Event], value_fn) -> dict:
    buckets: dict = {}
    for e in events:
        key = e.timestamp.date().isoformat()
        buckets[key] = buckets.get(key, 0.0) + value_fn(e)
    return buckets


def _build_baseline_stats(events: list[Event], user: User) -> dict:
    hour_histogram = [0] * 24
    locations = Counter()
    devices = Counter()
    apps = Counter()
    resource_types = Counter()
    actions = Counter()

    for e in events:
        hour_histogram[e.timestamp.hour] += 1
        if e.location:
            locations[e.location] += 1
        if e.device_label:
            devices[e.device_label] += 1
        apps[e.application] += 1
        if e.resource_type:
            resource_types[e.resource_type] += 1
        actions[e.action] += 1

    hours = [e.timestamp.hour for e in events]
    if hours:
        # The declared working-hours contract is a floor, not a ceiling: observed
        # behavior can only widen the normal window, never narrow it below what
        # the org already considers acceptable for this user.
        normal_hour_start = min(float(np.percentile(hours, 8)), float(user.normal_start_hour))
        normal_hour_end = max(float(np.percentile(hours, 92)), float(user.normal_end_hour))
    else:
        normal_hour_start, normal_hour_end = float(user.normal_start_hour), float(user.normal_end_hour)

    events_per_day = _per_day_counts(events, lambda e: 1)
    volume_per_day = _per_day_counts(events, lambda e: e.data_volume or 0.0)

    epd_values = list(events_per_day.values()) or [0.0]
    vpd_values = list(volume_per_day.values()) or [0.0]

    return {
        "hour_histogram": hour_histogram,
        "normal_hour_start": normal_hour_start,
        "normal_hour_end": normal_hour_end,
        "usual_locations": dict(locations),
        "usual_devices": dict(devices),
        "app_usage": dict(apps),
        "resource_categories": dict(resource_types),
        "action_frequencies": dict(actions),
        "avg_events_per_day": float(np.mean(epd_values)),
        "std_events_per_day": float(np.std(epd_values)),
        "avg_data_volume_per_day": float(np.mean(vpd_values)),
        "std_data_volume_per_day": float(np.std(vpd_values)),
        "sample_size": len(events),
    }


def compute_baseline(db: Session, user: User, baseline_type: str, as_of: datetime) -> Baseline:
    """Computes (and upserts) a single baseline row for a user as-of a point in time."""
    if baseline_type == BaselineType.LONG_TERM.value:
        window_end = as_of - timedelta(days=BASELINE_LONG_TERM_EXCLUDE_RECENT_DAYS)
        window_start = window_end - timedelta(days=BASELINE_LONG_TERM_DAYS)
    else:
        window_end = as_of
        window_start = as_of - timedelta(days=BASELINE_RECENT_DAYS)

    events = _events_in_window(db, user.id, window_start, window_end)
    stats = _build_baseline_stats(events, user)

    baseline = (
        db.query(Baseline)
        .filter(Baseline.user_id == user.id, Baseline.baseline_type == baseline_type)
        .one_or_none()
    )
    if baseline is None:
        baseline = Baseline(user_id=user.id, baseline_type=baseline_type)
        db.add(baseline)

    baseline.computed_at = as_of
    baseline.window_start = window_start
    baseline.window_end = window_end
    baseline.normal_hour_start = stats["normal_hour_start"]
    baseline.normal_hour_end = stats["normal_hour_end"]
    baseline.hour_histogram = stats["hour_histogram"]
    baseline.usual_locations = stats["usual_locations"]
    baseline.usual_devices = stats["usual_devices"]
    baseline.app_usage = stats["app_usage"]
    baseline.resource_categories = stats["resource_categories"]
    baseline.action_frequencies = stats["action_frequencies"]
    baseline.avg_events_per_day = stats["avg_events_per_day"]
    baseline.std_events_per_day = stats["std_events_per_day"]
    baseline.avg_data_volume_per_day = stats["avg_data_volume_per_day"]
    baseline.std_data_volume_per_day = stats["std_data_volume_per_day"]
    baseline.sample_size = stats["sample_size"]

    db.flush()
    return baseline
