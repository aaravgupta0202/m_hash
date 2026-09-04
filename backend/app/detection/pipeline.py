"""Orchestrates the full pipeline:

Events -> Feature Extraction (baseline) -> Deviation Detection -> Context
Evaluation -> Temporal/Multi-Signal Correlation -> Risk + Confidence ->
Explainable result.

This module is the single entry point both the seeding scripts and the live
simulation engine call to (re)compute a user's behavioral state as-of any
point in time.
"""
from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.context.context_engine import apply_context
from app.detection.baseline_engine import compute_baseline
from app.detection.behavioral_state import state_for_score
from app.detection.config import EVENT_ANALYSIS_WINDOW_DAYS, RISK_WEIGHTS
from app.detection.deviation_engine import deduplicate, evaluate_event, evaluate_volume_window
from app.detection.temporal_correlation import correlate
from app.models.baseline import BehavioralStateHistory
from app.models.enums import BaselineType
from app.models.event import Event
from app.models.user import User
from app.scoring.explain import build_explanation
from app.scoring.risk_engine import compute_risk


@dataclass
class PipelineResult:
    user_id: int
    as_of: datetime
    risk_score: float
    confidence: float
    behavioral_state: str
    signals: list
    correlation: object
    context_notes: list
    explanation: dict
    baseline_long: object
    baseline_recent: object
    events_window: list


def run_pipeline_for_user(db: Session, user: User, as_of: datetime, persist_history: bool = True) -> PipelineResult:
    baseline_long = compute_baseline(db, user, BaselineType.LONG_TERM.value, as_of)
    baseline_recent = compute_baseline(db, user, BaselineType.RECENT.value, as_of)

    window_start = as_of - timedelta(days=EVENT_ANALYSIS_WINDOW_DAYS)
    stmt = (
        select(Event)
        .where(Event.user_id == user.id, Event.timestamp >= window_start, Event.timestamp <= as_of)
        .order_by(Event.timestamp)
    )
    events_window = list(db.scalars(stmt))

    raw_signals = []
    for event in events_window:
        raw_signals.extend(evaluate_event(event, baseline_long))
    raw_signals.extend(evaluate_volume_window(events_window, baseline_long, as_of))

    signals = deduplicate(raw_signals)
    signals, context_notes = apply_context(db, user.id, signals, as_of)

    # Only genuinely material (not heavily context-discounted) signals should
    # drive cross-signal correlation bonuses - otherwise a well-explained
    # change could still rack up a "persistence" bonus from noise.
    correlation_input = [s for s in signals if s.effective_score() > 0.2]
    correlation = correlate(
        correlation_input,
        persistence_bonus_per_day=RISK_WEIGHTS["persistence_bonus_per_day"],
        persistence_cap=RISK_WEIGHTS["persistence_bonus_cap"],
        cross_app_bonus_max=RISK_WEIGHTS["cross_app_correlation_bonus"],
        burst_bonus_max=RISK_WEIGHTS["burst_correlation_bonus"],
    )

    risk_result = compute_risk(signals, correlation, baseline_long.sample_size)
    behavioral_state = state_for_score(risk_result.risk_score)
    explanation = build_explanation(signals, correlation, context_notes, risk_result.risk_score)

    if persist_history:
        db.add(BehavioralStateHistory(
            user_id=user.id,
            timestamp=as_of,
            state=behavioral_state,
            risk_score=risk_result.risk_score,
            confidence=risk_result.confidence,
        ))
        db.flush()

    return PipelineResult(
        user_id=user.id,
        as_of=as_of,
        risk_score=risk_result.risk_score,
        confidence=risk_result.confidence,
        behavioral_state=behavioral_state,
        signals=signals,
        correlation=correlation,
        context_notes=context_notes,
        explanation=explanation,
        baseline_long=baseline_long,
        baseline_recent=baseline_recent,
        events_window=events_window,
    )
