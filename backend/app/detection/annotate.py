"""Per-event severity labeling for the behavioral timeline UI.

Distinct from the aggregate risk pipeline: this answers "how should this one
event be color-coded in the timeline" rather than "what is the user's overall
risk right now". Labels: NORMAL, CONTEXTUAL, ANOMALOUS, SUSPICIOUS, HIGH_RISK.
"""
from app.context.context_engine import apply_context
from app.detection.deviation_engine import evaluate_event
from app.models.baseline import Baseline
from app.models.event import Event

LABEL_ORDER = ["NORMAL", "CONTEXTUAL", "ANOMALOUS", "SUSPICIOUS", "HIGH_RISK"]


def label_for_event(db, user_id: int, event: Event, baseline: Baseline) -> dict:
    signals = evaluate_event(event, baseline)
    if not signals:
        return {"label": "NORMAL", "signals": []}

    signals, _ = apply_context(db, user_id, signals, event.timestamp)

    material = [s for s in signals if s.effective_score() > 0.2]
    if not material:
        return {"label": "CONTEXTUAL", "signals": [s.reason for s in signals]}

    max_severity = max(material, key=lambda s: (
        {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}[s.severity], s.effective_score()
    ))
    if max_severity.severity == "CRITICAL" or (max_severity.severity == "HIGH" and max_severity.effective_score() > 0.6):
        label = "HIGH_RISK"
    elif max_severity.severity == "HIGH":
        label = "SUSPICIOUS"
    else:
        label = "ANOMALOUS"

    return {"label": label, "signals": [s.reason for s in material]}
