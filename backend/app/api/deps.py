from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from supabase import create_client, Client

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User,UserRole


supabase: Optional[Client] = None

if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
    supabase = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY,
    )


security = HTTPBearer(auto_error=False)


def get_client_ip(request: Request) -> Optional[str]:
    forwarded_for = request.headers.get("X-Forwarded-For")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    if request.client:
        return request.client.host

    return None


from app.core.security import decode_token


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization must use Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = credentials.credentials

    # 1. Try Supabase Auth if client is configured
    if supabase is not None:
        try:
            response = supabase.auth.get_user(access_token)
            supabase_user = response.user if response else None
            if supabase_user and supabase_user.email:
                user_email = supabase_user.email
                local_user = db.query(User).filter(User.email == user_email).first()
                if not local_user:
                    metadata = supabase_user.user_metadata or {}
                    local_user = User(
                        email=user_email,
                        name=metadata.get("name") or user_email.split("@")[0],
                        role=UserRole.USER,
                        password_hash="SUPABASE_AUTH_USER",
                        is_active=True
                    )
                    db.add(local_user)
                    db.commit()
                    db.refresh(local_user)

                if not local_user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="This account has been disabled.",
                    )
                return local_user
        except HTTPException:
            raise
        except Exception:
            pass

    # 2. Fallback to Local JWT Auth
    payload = decode_token(access_token)
    if payload and "sub" in payload:
        try:
            user_id = int(payload["sub"])
            local_user = db.query(User).filter(User.id == user_id).first()
            if local_user:
                if not local_user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="This account has been disabled.",
                    )
                return local_user
        except (ValueError, TypeError):
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:

    user_role = current_user.role

    if hasattr(user_role, "value"):
        user_role = user_role.value

    if str(user_role).lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user
