"""Transparent, additive risk scoring.

Risk = baseline_deviation + sensitive_resource_bonus + cross_app_correlation
       + burst_correlation + persistence - context_discount (already applied
       to each signal's score before it reaches here)

Confidence is scored separately from risk: it reflects how much evidence
backs the score (baseline sample size, number of corroborating signals,
cross-application corroboration) - NOT how bad the behavior looks.

Every component below is retained in the returned breakdown so the API/UI
can render a fully explainable "why is this suspicious" panel instead of a
bare number.
"""
from dataclasses import dataclass

from app.detection.config import DEVIATION_SCORE_CAP, RISK_WEIGHTS, SEVERITY_WEIGHT
from app.detection.signals import DeviationSignal
from app.detection.temporal_correlation import CorrelationResult


@dataclass
class RiskResult:
    risk_score: float
    confidence: float
    breakdown: dict
    behavioral_state: str = ""


def _clamp(value, lo=0.0, hi=100.0):
    return max(lo, min(hi, value))


def compute_deviation_component(signals: list[DeviationSignal]) -> float:
    total = 0.0
    for s in signals:
        total += SEVERITY_WEIGHT.get(s.severity, 10) * s.effective_score()
    return min(DEVIATION_SCORE_CAP, total)


def compute_risk(signals: list[DeviationSignal], correlation: CorrelationResult,
                  baseline_sample_size: int) -> RiskResult:
    deviation_component = compute_deviation_component(signals)

    sensitive_hit = any(
        s.resource_type and s.signal_type == "UNUSUAL_SENSITIVE_RESOURCE" and s.effective_score() > 0.3
        for s in signals
    ) or any(s.signal_type == "SENSITIVE_ACTION" and s.effective_score() > 0.3 for s in signals)
    sensitive_resource_bonus = RISK_WEIGHTS["sensitive_resource_bonus"] if sensitive_hit else 0.0

    cross_app_bonus = correlation.cross_app_bonus
    burst_bonus = correlation.burst_bonus
    persistence_bonus = correlation.persistence_bonus

    raw = deviation_component + sensitive_resource_bonus + cross_app_bonus + burst_bonus + persistence_bonus
    risk_score = _clamp(raw)

    # Confidence: grounded in evidence volume, not severity. With no signals
    # at all there is nothing to be confident about, regardless of how much
    # baseline history exists.
    if not signals:
        confidence_from_history = confidence_from_signals = confidence_from_corroboration = confidence_floor = 0.0
    else:
        confidence_from_history = min(35.0, (baseline_sample_size / 60.0) * 35.0)
        confidence_from_signals = min(35.0, len(signals) * 7.0)
        confidence_from_corroboration = 20.0 if cross_app_bonus > 0 else (10.0 if len(signals) >= 2 else 0.0)
        confidence_floor = 10.0
    confidence = _clamp(
        confidence_from_history + confidence_from_signals + confidence_from_corroboration + confidence_floor
    )

    breakdown = {
        "baseline_deviation": round(deviation_component, 1),
        "sensitive_resource_bonus": round(sensitive_resource_bonus, 1),
        "cross_app_correlation_bonus": round(cross_app_bonus, 1),
        "burst_correlation_bonus": round(burst_bonus, 1),
        "persistence_bonus": round(persistence_bonus, 1),
        "total_risk": round(risk_score, 1),
        "confidence_from_history": round(confidence_from_history, 1),
        "confidence_from_signals": round(confidence_from_signals, 1),
        "confidence_from_corroboration": round(confidence_from_corroboration, 1),
        "total_confidence": round(confidence, 1),
        "applications_involved": correlation.distinct_applications,
        "signal_count": len(signals),
    }

    return RiskResult(risk_score=risk_score, confidence=confidence, breakdown=breakdown)
