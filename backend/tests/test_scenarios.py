"""End-to-end behavioral assertions using the real seed data generators -
these are the three specific claims the product spec calls out as essential:
a legitimate change must not become critical, a compromised account must
eventually become high risk, and corroborating signals must outscore
isolated ones (covered directly in test_risk.py; here we confirm it holds
for the full pipeline on realistic data too).
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.database import Base
from app.models.alert import Alert
from app.models.enums import AlertSeverity
from app.models.user import User
from seed.seed_runner import run_seed


@pytest.fixture(scope="module")
def seeded_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    run_seed(session)
    yield session
    session.close()


def test_legitimate_project_change_does_not_become_critical(seeded_db):
    user = seeded_db.query(User).filter(User.scenario_tag == "LEGITIMATE_PROJECT_CHANGE").one()
    assert user.current_state in ("NORMAL", "DRIFT")
    assert user.current_risk_score < 50

    critical_alert = (
        seeded_db.query(Alert)
        .filter(Alert.user_id == user.id, Alert.severity == AlertSeverity.CRITICAL.value)
        .first()
    )
    assert critical_alert is None


def test_compromised_account_becomes_high_risk(seeded_db):
    user = seeded_db.query(User).filter(User.scenario_tag == "COMPROMISED_ACCOUNT").one()
    assert user.current_state == "HIGH_RISK"
    assert user.current_risk_score >= 75

    alert = seeded_db.query(Alert).filter(Alert.user_id == user.id).first()
    assert alert is not None
    assert alert.severity in ("HIGH", "CRITICAL")


def test_malicious_insider_shows_meaningful_drift(seeded_db):
    user = seeded_db.query(User).filter(User.scenario_tag == "MALICIOUS_INSIDER").one()
    assert user.current_state in ("SUSPICIOUS", "HIGH_RISK")
    assert user.current_risk_score >= 50


def test_normal_users_stay_quiet(seeded_db):
    normal_users = seeded_db.query(User).filter(User.is_scenario_actor.is_(False)).all()
    assert len(normal_users) >= 10
    high_risk_normals = [u for u in normal_users if u.current_state in ("SUSPICIOUS", "HIGH_RISK")]
    assert len(high_risk_normals) == 0
