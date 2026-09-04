"""Looks across a user's recent signals (not just one event at a time) to
find multi-signal, multi-application, multi-day patterns. This is what turns
six individually low/medium signals into one high-confidence correlated
picture (see README section on cross-application correlation).
"""
from dataclasses import dataclass, field

from app.detection.signals import DeviationSignal


@dataclass
class CorrelationResult:
    distinct_signal_types: int
    distinct_applications: list
    span_days: float
    burst_count: int  # signals clustered within a 1-hour window
    cross_app_bonus: float
    burst_bonus: float
    persistence_bonus: float
    narrative: list = field(default_factory=list)


def correlate(signals: list[DeviationSignal], persistence_bonus_per_day: float, persistence_cap: float,
              cross_app_bonus_max: float, burst_bonus_max: float) -> CorrelationResult:
    if not signals:
        return CorrelationResult(0, [], 0.0, 0, 0.0, 0.0, 0.0, [])

    occurred = [s.occurred_at for s in signals if s.occurred_at is not None]
    apps = sorted({s.application for s in signals if s.application})
    types = {s.signal_type for s in signals}

    span_days = 0.0
    if len(occurred) >= 2:
        span_days = (max(occurred) - min(occurred)).total_seconds() / 86400.0

    # Burst detection: sort by time, count the largest cluster within 1 hour.
    burst_count = 1
    times = sorted(occurred)
    for i in range(len(times)):
        window_count = sum(1 for t in times if 0 <= (t - times[i]).total_seconds() <= 3600)
        burst_count = max(burst_count, window_count)

    cross_app_bonus = cross_app_bonus_max if len(apps) >= 2 else 0.0
    burst_bonus = burst_bonus_max if burst_count >= 3 else (burst_bonus_max * 0.5 if burst_count == 2 else 0.0)
    persistence_bonus = min(persistence_cap, span_days * persistence_bonus_per_day) if span_days >= 1 else 0.0

    narrative = []
    if cross_app_bonus:
        narrative.append(f"Unusual activity appeared across {len(apps)} applications ({', '.join(apps)})")
    if burst_bonus:
        narrative.append(f"{burst_count} distinct signals clustered within a single hour")
    if persistence_bonus:
        narrative.append(f"Behavioral deviation persisted for {span_days:.1f} days")

    return CorrelationResult(
        distinct_signal_types=len(types),
        distinct_applications=apps,
        span_days=span_days,
        burst_count=burst_count,
        cross_app_bonus=cross_app_bonus,
        burst_bonus=burst_bonus,
        persistence_bonus=persistence_bonus,
        narrative=narrative,
    )
