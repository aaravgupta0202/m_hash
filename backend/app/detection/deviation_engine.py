"""Compares individual events (and short windows of events) against a user's
baseline to produce DeviationSignal evidence. Application-agnostic: it only
ever looks at the unified Event fields.
"""
from datetime import timedelta

from app.detection.config import (
    RARE_SHARE_THRESHOLD,
    SENSITIVE_ACTIONS,
    SENSITIVE_RESOURCE_LEVELS,
    UNUSUAL_HOUR_MARGIN_HOURS,
    VOLUME_ZSCORE_HIGH,
    VOLUME_ZSCORE_MEDIUM,
)
from app.detection.signals import DeviationSignal
from app.models.baseline import Baseline
from app.models.event import Event


def _share(counter: dict, key: str) -> float:
    total = sum(counter.values())
    if total == 0:
        return 0.0
    return counter.get(key, 0) / total


def _is_rare(counter: dict, key: str, min_count: int, threshold: float = RARE_SHARE_THRESHOLD) -> bool:
    """An action/app/resource is only 'rare' if it is both proportionally
    uncommon AND hasn't happened often enough to be an established habit.
    A once-a-week task that is still 100% expected for this role should not
    be flagged just because it is a small share of a very active user's
    total events.
    """
    count = counter.get(key, 0)
    if count == 0:
        return True
    if count >= min_count:
        return False
    return _share(counter, key) < threshold


def evaluate_event(event: Event, baseline: Baseline) -> list[DeviationSignal]:
    signals: list[DeviationSignal] = []
    if baseline.sample_size == 0:
        return signals  # no history yet - nothing to compare against

    hour = event.timestamp.hour + event.timestamp.minute / 60.0
    lo = baseline.normal_hour_start - UNUSUAL_HOUR_MARGIN_HOURS
    hi = baseline.normal_hour_end + UNUSUAL_HOUR_MARGIN_HOURS
    if hour < lo or hour > hi:
        distance = min(abs(hour - lo), abs(hour - hi), abs(hour - lo + 24), abs(hour - hi - 24))
        score = float(min(1.0, distance / 6.0))
        severity = "HIGH" if hour < 5 or hour > 23 else ("MEDIUM" if score > 0.4 else "LOW")
        signals.append(DeviationSignal(
            signal_type="UNUSUAL_TIME",
            severity=severity,
            score=max(score, 0.15),
            reason=f"Activity occurred at {event.timestamp.strftime('%H:%M')}, outside the normal "
                   f"{baseline.normal_hour_start:.0f}:00-{baseline.normal_hour_end:.0f}:00 window",
            application=event.application,
            event_id=event.id,
            occurred_at=event.timestamp,
            dedupe_key=f"UNUSUAL_TIME:{event.timestamp.date()}",
        ))

    if event.device_label and event.device_label not in baseline.usual_devices:
        signals.append(DeviationSignal(
            signal_type="NEW_DEVICE",
            severity="MEDIUM",
            score=0.6,
            reason=f"Device '{event.device_label}' has never been observed for this user",
            application=event.application,
            event_id=event.id,
            occurred_at=event.timestamp,
            dedupe_key=f"NEW_DEVICE:{event.device_label}",
        ))

    if event.location and event.location not in baseline.usual_locations:
        signals.append(DeviationSignal(
            signal_type="UNUSUAL_LOCATION",
            severity="MEDIUM",
            score=0.55,
            reason=f"Access from '{event.location}', a location not seen in this user's history",
            application=event.application,
            event_id=event.id,
            occurred_at=event.timestamp,
            dedupe_key=f"UNUSUAL_LOCATION:{event.location}",
        ))

    if _is_rare(baseline.app_usage, event.application, min_count=6):
        app_share = _share(baseline.app_usage, event.application)
        signals.append(DeviationSignal(
            signal_type="UNUSUAL_APPLICATION",
            severity="MEDIUM",
            score=0.5,
            reason=f"User rarely or never uses {event.application} ({app_share * 100:.0f}% of normal activity)",
            application=event.application,
            event_id=event.id,
            occurred_at=event.timestamp,
            dedupe_key=f"UNUSUAL_APPLICATION:{event.application}",
        ))

    if event.resource_sensitivity in SENSITIVE_RESOURCE_LEVELS:
        if _is_rare(baseline.resource_categories, event.resource_type or "", min_count=2):
            signals.append(DeviationSignal(
                signal_type="UNUSUAL_SENSITIVE_RESOURCE",
                severity="HIGH",
                score=0.75,
                reason=f"Accessed {event.resource_sensitivity.lower()} resource "
                       f"'{event.resource_type}', atypical for this user",
                application=event.application,
                event_id=event.id,
                occurred_at=event.timestamp,
                resource_id=event.resource_id,
                resource_type=event.resource_type,
                dedupe_key=f"UNUSUAL_SENSITIVE_RESOURCE:{event.resource_type}",
            ))

    if event.action in SENSITIVE_ACTIONS:
        if _is_rare(baseline.action_frequencies, event.action, min_count=4):
            signals.append(DeviationSignal(
                signal_type="SENSITIVE_ACTION",
                severity="HIGH",
                score=0.65,
                reason=f"Performed '{event.action}', an infrequent and sensitive action for this user",
                application=event.application,
                event_id=event.id,
                occurred_at=event.timestamp,
                dedupe_key=f"SENSITIVE_ACTION:{event.action}",
            ))
    elif event.action not in baseline.action_frequencies:
        signals.append(DeviationSignal(
            signal_type="UNUSUAL_ACTION",
            severity="LOW",
            score=0.3,
            reason=f"Action '{event.action}' has not been observed for this user before",
            application=event.application,
            event_id=event.id,
            occurred_at=event.timestamp,
            dedupe_key=f"UNUSUAL_ACTION:{event.action}",
        ))

    return signals


def evaluate_volume_window(events: list[Event], baseline: Baseline, window_end) -> list[DeviationSignal]:
    """Aggregate check: event count and data volume in the trailing 24h vs baseline."""
    signals: list[DeviationSignal] = []
    if baseline.sample_size == 0 or not events:
        return signals

    window_start = window_end - timedelta(hours=24)
    recent = [e for e in events if window_start <= e.timestamp <= window_end]
    if not recent:
        return signals

    count = len(recent)
    volume = sum(e.data_volume or 0.0 for e in recent)

    std_e = baseline.std_events_per_day or 1.0
    std_v = baseline.std_data_volume_per_day or 1.0
    z_count = (count - baseline.avg_events_per_day) / std_e
    z_volume = (volume - baseline.avg_data_volume_per_day) / std_v

    if z_count >= VOLUME_ZSCORE_MEDIUM:
        severity = "HIGH" if z_count >= VOLUME_ZSCORE_HIGH else "MEDIUM"
        signals.append(DeviationSignal(
            signal_type="UNUSUAL_EVENT_VOLUME",
            severity=severity,
            score=float(min(1.0, z_count / 5)),
            reason=f"{count} events in 24h is {count / max(baseline.avg_events_per_day, 1):.1f}x "
                   f"this user's typical daily activity",
            occurred_at=window_end,
            dedupe_key=f"UNUSUAL_EVENT_VOLUME:{window_end.date()}",
        ))

    if z_volume >= VOLUME_ZSCORE_MEDIUM:
        severity = "HIGH" if z_volume >= VOLUME_ZSCORE_HIGH else "MEDIUM"
        signals.append(DeviationSignal(
            signal_type="UNUSUAL_DATA_VOLUME",
            severity=severity,
            score=float(min(1.0, z_volume / 5)),
            reason=f"Data activity of {volume:.0f}KB in 24h is "
                   f"{volume / max(baseline.avg_data_volume_per_day, 1):.1f}x baseline",
            occurred_at=window_end,
            dedupe_key=f"UNUSUAL_DATA_VOLUME:{window_end.date()}",
        ))

    return signals


def deduplicate(signals: list[DeviationSignal]) -> list[DeviationSignal]:
    """Keeps the strongest occurrence per dedupe key, but that's used for
    scoring; callers that need the full evidence trail should keep the raw list."""
    best: dict = {}
    for s in signals:
        key = s.dedupe_key or f"{s.signal_type}:{s.event_id}"
        if key not in best or s.score > best[key].score:
            best[key] = s
    return list(best.values())
