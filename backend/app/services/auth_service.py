from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.schemas.auth import RegisterRequest, LoginRequest
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    @staticmethod
    def register_user(db: Session, req: RegisterRequest, ip_address: Optional[str] = None) -> User:
        # Check existing email
        existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )
            
        user = User(
            name=req.name.strip(),
            email=req.email.lower().strip(),
            password_hash=get_password_hash(req.password),
            role=UserRole.USER,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Log registration audit
        audit = AuditLog(
            user_id=user.id,
            action="USER_REGISTER",
            details=f"New user registered: {user.email}",
            ip_address=ip_address
        )
        db.add(audit)
        db.commit()
        
        return user

    @staticmethod
    def authenticate_user(db: Session, req: LoginRequest, ip_address: Optional[str] = None) -> User:
        user = db.query(User).filter(User.email == req.email.lower().strip()).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )
            
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been disabled. Please contact an administrator."
            )
            
        # Log login audit
        audit = AuditLog(
            user_id=user.id,
            action="USER_LOGIN",
            details=f"User login successful: {user.email}",
            ip_address=ip_address
        )
        db.add(audit)
        db.commit()
        
        return user

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def update_profile(db: Session, user: User, name: Optional[str] = None, password: Optional[str] = None) -> User:
        if name:
            user.name = name.strip()
        if password:
            user.password_hash = get_password_hash(password)
            
        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        return user
