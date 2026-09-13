from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings
from app.database.base import Base

# Register all models
import app.models


connect_args = {}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Database tables initialized successfully.")

    except Exception as exc:
        db.rollback()
        print(f"Database initialization error: {exc}")

    finally:
        db.close()
