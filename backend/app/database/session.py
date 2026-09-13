from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.database.base import Base

# Import models so SQLAlchemy registers all tables
import app.models  # noqa: F401


DATABASE_URL = settings.DATABASE_URL

connect_args = {}

# SQLite configuration
if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }

# PostgreSQL/Supabase configuration
elif DATABASE_URL.startswith("postgresql"):
    connect_args = {
        "sslmode": "require"
    }

engine = create_engine(
    DATABASE_URL,
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
    """
    Provide a database session for FastAPI requests.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create database tables when the application starts.
    """
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
