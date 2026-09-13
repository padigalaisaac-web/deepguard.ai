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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
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

    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase environment variables are missing.",
        )

    access_token = credentials.credentials

    try:
        response = supabase.auth.get_user(access_token)
        supabase_user = response.user

    except Exception as exc:
        print(f"Supabase token validation error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Could not validate credentials. "
                "Please log in again."
            ),
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not supabase_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Supabase user.",
        )

    user_email = supabase_user.email

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase account email not found.",
        )

    local_user = (
        db.query(User)
        .filter(User.email == user_email)
        .first()
    )

    if not local_user:
        metadata = supabase_user.user_metadata or {}

        local_user = User(
            email=user_email,
            name=(
                metadata.get("name")
                or user_email.split("@")[0]
            ),
            role="user",
            password_hash="SUPABASE_AUTH_USER",
        )

        db.add(local_user)
        db.commit()
        db.refresh(local_user)

    return local_user


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
