import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test_deepguard.db"

from app.database.base import Base
from app.database.session import get_db, engine, SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.main import app

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    admin_user = User(
        name="DeepGuard Administrator",
        email="admin@deepguard.ai",
        password_hash=get_password_hash("Admin@123456"),
        role=UserRole.ADMIN,
        is_active=True
    )
    demo_user = User(
        name="Dr. Alex Vance",
        email="user@deepguard.ai",
        password_hash=get_password_hash("User@123456"),
        role=UserRole.USER,
        is_active=True
    )
    db.add(admin_user)
    db.add(demo_user)
    db.commit()
    db.close()
    
    yield
    
    # Cleanup
    Base.metadata.drop_all(bind=engine)
    test_db_file = "./test_deepguard.db"
    if os.path.exists(test_db_file):
        try:
            os.remove(test_db_file)
        except Exception:
            pass

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
