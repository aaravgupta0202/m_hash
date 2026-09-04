"""Deterministic, evidence-driven explanations. No LLM involved: every bullet
comes directly from a DeviationSignal or a correlation/context finding.
"""
from app.detection.signals import DeviationSignal
from app.detection.temporal_correlation import CorrelationResult

SEVERITY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}


def build_explanation(signals: list[DeviationSignal], correlation: CorrelationResult,
                       context_notes: list[str], risk_score: float) -> dict:
    active = sorted(
        [s for s in signals if s.effective_score() > 0.05],
        key=lambda s: (SEVERITY_ORDER.get(s.severity, 4), -s.effective_score()),
    )

    bullets = []
    seen_reasons = set()
    for s in active:
        if s.reason in seen_reasons:
            continue
        seen_reasons.add(s.reason)
        prefix = "~" if s.contextualized else "+"
        bullets.append(f"{prefix} {s.reason}")
        if len(bullets) >= 8:
            break

    for note in correlation.narrative:
        bullets.append(f"+ {note}")

    headline = "No meaningful behavioral deviation detected." if not bullets else (
        f"Risk score is {risk_score:.0f} because of {len(active)} contributing signal(s)"
        f"{' spanning ' + ', '.join(correlation.distinct_applications) if correlation.distinct_applications else ''}."
    )

    return {
        "headline": headline,
        "bullets": bullets,
        "context": context_notes,
    }
