from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.database.base import Base
import app.models  # Ensure all models are registered

# Connect args for SQLite to allow multi-threading in FastAPI
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    # Seed initial users and sample data if empty
    db = SessionLocal()
    try:
        from app.models.user import User, UserRole
        from app.core.security import get_password_hash
        
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@deepguard.ai").first()
        if not admin:
            admin_user = User(
                name="DeepGuard Administrator",
                email="admin@deepguard.ai",
                password_hash=get_password_hash("Admin@123456"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            
        # Check if demo user exists
        demo = db.query(User).filter(User.email == "user@deepguard.ai").first()
        if not demo:
            demo_user = User(
                name="Dr. Alex Vance",
                email="user@deepguard.ai",
                password_hash=get_password_hash("User@123456"),
                role=UserRole.USER,
                is_active=True
            )
            db.add(demo_user)
            
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error initializing/seeding database: {e}")
    finally:
        db.close()
