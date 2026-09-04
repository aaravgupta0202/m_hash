import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 - ensures every table is registered on Base.metadata
from app.database import Base
from app.models.org import Department, Role
from app.models.user import User


@pytest.fixture()
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_local = sessionmaker(bind=engine)
    session = session_local()
    yield session
    session.close()


@pytest.fixture()
def make_user(db):
    def _make(name="Test User", role="Software Engineer", department="Engineering",
              normal_start_hour=9, normal_end_hour=18, usual_locations=None):
        role_row = db.query(Role).filter_by(name=role).one_or_none() or Role(name=role)
        dept_row = db.query(Department).filter_by(name=department).one_or_none() or Department(name=department)
        db.add(role_row)
        db.add(dept_row)
        db.flush()
        user = User(
            name=name, email=f"{name.replace(' ', '.').lower()}@example.com",
            role_id=role_row.id, department_id=dept_row.id,
            normal_start_hour=normal_start_hour, normal_end_hour=normal_end_hour,
            usual_locations=usual_locations or ["New York, US"],
        )
        db.add(user)
        db.flush()
        return user
    return _make
