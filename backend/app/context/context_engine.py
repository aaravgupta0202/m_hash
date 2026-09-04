"""The context engine is what stops the platform from treating every
deviation as malicious. It looks up legitimate organizational facts (project
assignments, approved travel, device approvals, temporary access, maintenance
windows) and discounts the deviation signals they plausibly explain.
"""
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.detection.config import CONTEXT_DISCOUNT
from app.detection.signals import DeviationSignal
from app.models.context import ContextEvent
from app.models.enums import ContextType

DEFAULT_VALIDITY_DAYS = 45

CONTEXT_APPLIES_TO = {
    ContextType.NEW_DEVICE_APPROVAL.value: {"NEW_DEVICE"},
    ContextType.APPROVED_TRAVEL.value: {"UNUSUAL_LOCATION"},
    ContextType.PROJECT_ASSIGNMENT.value: {
        "UNUSUAL_APPLICATION", "UNUSUAL_SENSITIVE_RESOURCE", "UNUSUAL_ACTION", "SENSITIVE_ACTION",
        "UNUSUAL_EVENT_VOLUME", "UNUSUAL_DATA_VOLUME",
    },
    ContextType.ROLE_CHANGE.value: {
        "UNUSUAL_APPLICATION", "UNUSUAL_SENSITIVE_RESOURCE", "UNUSUAL_ACTION", "SENSITIVE_ACTION",
    },
    ContextType.TEMPORARY_ACCESS.value: {"UNUSUAL_SENSITIVE_RESOURCE", "UNUSUAL_APPLICATION", "SENSITIVE_ACTION"},
    ContextType.MAINTENANCE_ACTIVITY.value: {"UNUSUAL_TIME", "UNUSUAL_EVENT_VOLUME", "UNUSUAL_DATA_VOLUME"},
}


def _active_contexts(db: Session, user_id: int, as_of: datetime) -> list[ContextEvent]:
    stmt = select(ContextEvent).where(ContextEvent.user_id == user_id)
    contexts = list(db.scalars(stmt))
    active = []
    for c in contexts:
        end = c.end_date or (c.start_date + timedelta(days=DEFAULT_VALIDITY_DAYS))
        if c.start_date <= as_of <= end:
            active.append(c)
    return active


def apply_context(db: Session, user_id: int, signals: list[DeviationSignal], as_of: datetime):
    contexts = _active_contexts(db, user_id, as_of)
    context_notes: list[str] = []
    explained_any = False
    unexplained_strong_signal = False

    for signal in signals:
        matched = None
        for ctx in contexts:
            applicable_types = CONTEXT_APPLIES_TO.get(ctx.context_type, set())
            if signal.signal_type in applicable_types:
                matched = ctx
                break

        if matched:
            discount = CONTEXT_DISCOUNT.get(matched.context_type, 1.0)
            signal.adjusted_score = round(signal.score * discount, 3)
            signal.contextualized = True
            signal.context_note = matched.description
            note = f"{matched.description} plausibly explains '{signal.signal_type.replace('_', ' ').title()}'"
            if note not in context_notes:
                context_notes.append(note)
            explained_any = True
        else:
            signal.adjusted_score = signal.score
            if signal.severity in ("HIGH", "CRITICAL"):
                unexplained_strong_signal = True

    if unexplained_strong_signal and not explained_any:
        context_notes.append("No recent role or project change explains the activity.")

    return signals, context_notes
