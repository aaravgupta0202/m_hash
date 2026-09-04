from datetime import datetime, timedelta

from app.context.context_engine import apply_context
from app.detection.signals import DeviationSignal
from app.models.context import ContextEvent


def test_project_assignment_discounts_matching_signal(db, make_user):
    user = make_user()
    now = datetime.utcnow()
    db.add(ContextEvent(
        user_id=user.id, context_type="PROJECT_ASSIGNMENT",
        description="Assigned to Project Phoenix", start_date=now - timedelta(days=5), end_date=None,
    ))
    db.commit()

    signal = DeviationSignal(
        signal_type="UNUSUAL_SENSITIVE_RESOURCE", severity="HIGH", score=0.8,
        reason="Accessed confidential resource", occurred_at=now,
    )
    signals, notes = apply_context(db, user.id, [signal], now)

    assert signals[0].contextualized is True
    assert signals[0].effective_score() < signal.score
    assert any("Phoenix" in n for n in notes)


def test_unrelated_signal_is_not_discounted(db, make_user):
    user = make_user()
    now = datetime.utcnow()
    db.add(ContextEvent(
        user_id=user.id, context_type="APPROVED_TRAVEL",
        description="Approved travel to London", start_date=now - timedelta(days=1), end_date=None,
    ))
    db.commit()

    signal = DeviationSignal(
        signal_type="SENSITIVE_ACTION", severity="HIGH", score=0.7,
        reason="Performed a sensitive action", occurred_at=now,
    )
    signals, notes = apply_context(db, user.id, [signal], now)

    assert signals[0].contextualized is False
    assert signals[0].effective_score() == signal.score
    assert "No recent role or project change explains the activity." in notes


def test_no_context_leaves_signal_unexplained(db, make_user):
    user = make_user()
    now = datetime.utcnow()
    signal = DeviationSignal(
        signal_type="SENSITIVE_ACTION", severity="HIGH", score=0.7,
        reason="Performed a sensitive action", occurred_at=now,
    )
    signals, notes = apply_context(db, user.id, [signal], now)
    assert signals[0].contextualized is False
    assert "No recent role or project change explains the activity." in notes
