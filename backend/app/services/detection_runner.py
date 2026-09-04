"""Convenience wrapper used by seeding, the mock apps, and the simulation
engine: run the full detection pipeline for a user, cache the result on the
user row for fast dashboard reads, and generate/update an alert if warranted.
"""
from datetime import datetime

from sqlalchemy.orm import Session

from app.detection.pipeline import PipelineResult, run_pipeline_for_user
from app.models.user import User
from app.services.alert_service import generate_or_update_alert


def recompute_user_state(db: Session, user: User, as_of: datetime, persist_history: bool = True,
                          update_current: bool = True, commit: bool = True) -> PipelineResult:
    result = run_pipeline_for_user(db, user, as_of, persist_history=persist_history)

    if update_current:
        user.current_risk_score = result.risk_score
        user.current_confidence = result.confidence
        user.current_state = result.behavioral_state
        user.state_updated_at = as_of

    generate_or_update_alert(db, user, result)

    if commit:
        db.commit()
    return result
