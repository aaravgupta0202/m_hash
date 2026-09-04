"""Database engine/session setup.

SQLite is used for the prototype. All models are declared with SQLAlchemy's
ORM so the storage layer can be swapped to PostgreSQL later by changing only
DATABASE_URL - no application code depends on SQLite-specific behavior.
"""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "security_center.db")
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
