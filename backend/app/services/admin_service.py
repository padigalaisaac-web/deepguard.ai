import os
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.user import User, UserRole
from app.models.analysis import Analysis
from app.models.audit_log import AuditLog
from app.schemas.admin import AdminUserItem, AdminAuditLogItem, SystemHealth

class AdminService:
    @staticmethod
    def list_users(db: Session, page: int = 1, page_size: int = 20, search: Optional[str] = None) -> Tuple[List[AdminUserItem], int]:
        query = db.query(User)
        if search:
            s = f"%{search.strip()}%"
            query = query.filter(User.name.ilike(s) | User.email.ilike(s))
            
        total = query.count()
        users = query.order_by(desc(User.created_at)).offset((page - 1) * page_size).limit(page_size).all()
        
        items = []
        for u in users:
            analysis_count = db.query(Analysis).filter(Analysis.user_id == u.id).count()
            items.append(AdminUserItem(
                id=u.id,
                name=u.name,
                email=u.email,
                role=u.role,
                is_active=u.is_active,
                analysis_count=analysis_count,
                created_at=u.created_at,
                updated_at=u.updated_at
            ))
        return items, total

    @staticmethod
    def update_user_status(db: Session, user_id: int, is_active: bool, admin_user: User) -> User:
        if user_id == admin_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot disable your own admin account.")
            
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
            
        user.is_active = is_active
        user.updated_at = datetime.now(timezone.utc)
        
        audit = AuditLog(
            user_id=admin_user.id,
            action="USER_STATUS_CHANGE",
            details=f"Admin {admin_user.email} changed user {user.email} status to {'active' if is_active else 'disabled'}"
        )
        db.add(audit)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_audit_logs(db: Session, page: int = 1, page_size: int = 25, search: Optional[str] = None) -> Tuple[List[AdminAuditLogItem], int]:
        query = db.query(AuditLog)
        if search:
            s = f"%{search.strip()}%"
            query = query.filter(AuditLog.action.ilike(s) | AuditLog.details.ilike(s) | AuditLog.analysis_id.ilike(s))
            
        total = query.count()
        logs = query.order_by(desc(AuditLog.timestamp)).offset((page - 1) * page_size).limit(page_size).all()
        
        items = []
        for l in logs:
            user_email = l.user.email if l.user else "System / Anonymous"
            items.append(AdminAuditLogItem(
                id=l.id,
                user_id=l.user_id,
                user_email=user_email,
                action=l.action,
                analysis_id=l.analysis_id,
                details=l.details,
                ip_address=l.ip_address,
                timestamp=l.timestamp
            ))
        return items, total

    @staticmethod
    def get_system_health(db: Session) -> SystemHealth:
        # Check DB connection
        db_connected = True
        try:
            db.execute(func.now()).scalar()
        except Exception:
            db_connected = False
            
        # Storage calculation
        total_storage_bytes = 0
        total_uploads = 0
        if settings.UPLOAD_DIR.exists():
            for f in settings.UPLOAD_DIR.glob("**/*"):
                if f.is_file():
                    total_storage_bytes += f.stat().st_size
                    total_uploads += 1
                    
        storage_mb = round(total_storage_bytes / (1024 * 1024), 2)
        
        return SystemHealth(
            status="OPERATIONAL" if db_connected else "DEGRADED",
            database_connected=db_connected,
            ai_engine_status="READY",
            ai_engine_mode="PROTOTYPE_DETERMINISTIC" if settings.DEMO_MODE else "PRODUCTION_NEURAL",
            storage_used_mb=storage_mb,
            total_uploads=total_uploads,
            timestamp=datetime.now(timezone.utc)
        )
