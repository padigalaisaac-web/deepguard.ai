from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_admin_user
from app.models.user import User
from app.schemas.admin import AdminUserItem, AdminAuditLogItem, SystemHealth
from app.schemas.user import UserStatusUpdate
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/users", response_model=dict)
def get_admin_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users, total = AdminService.list_users(db, page=page, page_size=page_size, search=search)
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [u.model_dump() for u in users]
    }

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int = Path(..., ge=1),
    status_update: UserStatusUpdate = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = AdminService.update_user_status(
        db=db,
        user_id=user_id,
        is_active=status_update.is_active,
        admin_user=current_admin
    )
    return {"message": f"User status updated to {'active' if user.is_active else 'disabled'}.", "is_active": user.is_active}

@router.get("/audit-logs", response_model=dict)
def get_admin_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    logs, total = AdminService.list_audit_logs(db, page=page, page_size=page_size, search=search)
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [l.model_dump() for l in logs]
    }

@router.get("/system-health", response_model=SystemHealth)
def get_system_health(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return AdminService.get_system_health(db)
