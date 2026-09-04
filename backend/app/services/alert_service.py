"""Turns a pipeline result into an alert - but only when the evidence
actually clears a threshold. Individually weak signals never become alerts;
only aggregated, correlated, above-threshold risk does (see product spec:
"Do NOT create alerts for every anomaly").
"""
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.detection.behavioral_state import severity_for_score
from app.detection.config import ALERT_MERGE_WINDOW_DAYS, ALERT_MIN_SCORE_TO_CREATE
from app.detection.pipeline import PipelineResult
from app.models.alert import Alert, AlertEvidence
from app.models.enums import AlertStatus
from app.models.user import User


def _affected_resources(result: PipelineResult) -> list:
    seen = []
    for s in result.signals:
        if s.resource_id and s.resource_id not in seen and s.effective_score() > 0.05:
            seen.append(s.resource_id)
    return seen[:20]


def generate_or_update_alert(db: Session, user: User, result: PipelineResult) -> Alert | None:
    if result.risk_score < ALERT_MIN_SCORE_TO_CREATE:
        return None

    severity = severity_for_score(result.risk_score)
    applications = result.correlation.distinct_applications or sorted({
        s.application for s in result.signals if s.application
    })
    resources = _affected_resources(result)

    merge_cutoff = result.as_of - timedelta(days=ALERT_MERGE_WINDOW_DAYS)
    stmt = (
        select(Alert)
        .where(
            Alert.user_id == user.id,
            Alert.status.in_([AlertStatus.OPEN.value, AlertStatus.ACKNOWLEDGED.value]),
            Alert.last_observed >= merge_cutoff,
        )
        .order_by(Alert.last_observed.desc())
    )
    alert = db.scalars(stmt).first()

    title = f"{result.behavioral_state.replace('_', ' ').title()} behavioral shift: {user.name}"
    summary = result.explanation["headline"]

    if alert is None:
        alert = Alert(
            user_id=user.id,
            risk_score=result.risk_score,
            confidence=result.confidence,
            severity=severity,
            status=AlertStatus.OPEN.value,
            behavioral_state=result.behavioral_state,
            title=title,
            summary=summary,
            first_observed=result.as_of,
            last_observed=result.as_of,
            affected_applications=list(applications),
            affected_resources=resources,
            context_notes=result.context_notes,
            created_at=result.as_of,
            updated_at=result.as_of,
        )
        db.add(alert)
        db.flush()
    else:
        alert.risk_score = result.risk_score
        alert.confidence = result.confidence
        alert.severity = severity
        alert.behavioral_state = result.behavioral_state
        alert.title = title
        alert.summary = summary
        alert.last_observed = result.as_of
        alert.affected_applications = sorted(set(alert.affected_applications) | set(applications))
        alert.affected_resources = list(dict.fromkeys(alert.affected_resources + resources))[:30]
        alert.context_notes = result.context_notes
        alert.updated_at = result.as_of

    existing_keys = {
        (e.signal_type, e.description) for e in
        db.query(AlertEvidence).filter(AlertEvidence.alert_id == alert.id).all()
    } if alert.id else set()

    for s in result.signals:
        if s.effective_score() <= 0.05:
            continue
        key = (s.signal_type, s.reason)
        if key in existing_keys:
            continue
        existing_keys.add(key)
        db.add(AlertEvidence(
            alert_id=alert.id,
            signal_type=s.signal_type,
            description=s.reason,
            severity=s.severity,
            deviation_score=s.effective_score(),
            application=s.application,
            event_id=s.event_id,
            occurred_at=s.occurred_at or result.as_of,
        ))

    db.flush()
    return alert
