"""Generates one day's worth of realistic, in-baseline events for a user."""
import random
from datetime import date, datetime, timedelta

from seed.activity_profiles import ACTION_CATALOG, ROLE_PROFILES, WEEKEND_MULTIPLIER


def _weighted_choice(rng: random.Random, weights: dict) -> str:
    items = list(weights.keys())
    w = list(weights.values())
    return rng.choices(items, weights=w, k=1)[0]


def generate_day_events(
    rng: random.Random,
    user_name: str,
    role: str,
    day: date,
    normal_start_hour: int,
    normal_end_hour: int,
    home_location: str,
    secondary_location: str | None,
    primary_device: str,
    secondary_device: str | None,
    project_slug: str | None,
) -> list[dict]:
    """Returns a list of kwargs dicts ready for event_service.record_event
    (minus user_id/timestamp bookkeeping fields added by the caller)."""
    profile = ROLE_PROFILES.get(role, {})
    events = []
    is_weekend = day.weekday() >= 5
    multiplier = WEEKEND_MULTIPLIER if is_weekend else 1.0

    span = max(normal_end_hour - normal_start_hour, 4)
    # Stagger each application's typical session start across the workday
    # (morning / midday / afternoon) so the aggregate baseline spans the
    # full normal-hours window instead of collapsing to a narrow spike.
    app_phase = {"GMAIL": 0.2, "SOCIAL": 0.5, "FINANCE": 0.8}

    for application, app_profile in profile.items():
        lo, hi = app_profile["daily_range"]
        n = int(round(rng.randint(lo, hi) * multiplier))
        if n <= 0:
            continue

        phase_center = normal_start_hour + span * app_phase.get(application, 0.5)
        session_start = max(0.0, min(23.5, rng.gauss(phase_center, 1.8)))
        location = home_location
        if secondary_location and rng.random() < 0.08:
            location = secondary_location
        device = primary_device
        if secondary_device and rng.random() < 0.12:
            device = secondary_device

        t = session_start
        actions_left = n
        catalog = ACTION_CATALOG[application]
        weights = {a: w for a, w in app_profile["weights"].items() if a in catalog}

        # Every session opens with a LOGIN.
        events.append(_build_event(application, "LOGIN", catalog, day, t, location, device, project_slug))
        actions_left -= 1

        non_login_weights = {a: w for a, w in weights.items() if a != "LOGIN"}
        while actions_left > 0 and non_login_weights:
            t += rng.uniform(0.03, 0.25)  # 2-15 minutes later
            if t > 23.9:
                break
            action = _weighted_choice(rng, non_login_weights)
            events.append(_build_event(application, action, catalog, day, t, location, device, project_slug))
            actions_left -= 1

    events.sort(key=lambda e: e["_hour"])
    return events


def _build_event(application, action, catalog, day, hour_float, location, device, project_slug) -> dict:
    event_type, resource_type, sensitivity, vol_range = catalog[action]
    hour = int(hour_float) % 24
    minute = int((hour_float % 1) * 60)
    timestamp = datetime.combine(day, datetime.min.time()) + timedelta(hours=hour, minutes=minute)

    if resource_type and project_slug and application in ("GMAIL", "SOCIAL") and resource_type in ("attachment", "media", "email_thread"):
        resource_type = f"{project_slug}_{resource_type}"

    resource_id = f"{resource_type}-{random.Random(f'{timestamp}{action}').randint(1000, 9999)}" if resource_type else None
    data_volume = round(random.Random(f'{timestamp}{action}vol').uniform(*vol_range), 1)

    return {
        "application": application,
        "event_type": event_type,
        "action": action,
        "resource_id": resource_id,
        "resource_type": resource_type,
        "resource_sensitivity": sensitivity,
        "device_name": device,
        "location": location,
        "data_volume": data_volume,
        "timestamp": timestamp,
        "_hour": hour_float,
    }
