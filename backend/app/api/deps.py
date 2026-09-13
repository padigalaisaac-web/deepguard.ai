from typing import Optional

from fastapi import (
    Depends,
    HTTPException,
    Request,
    status,
)
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from sqlalchemy.orm import Session
from supabase import create_client, Client

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User


if not settings.SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is missing in Render environment variables."
    )

if not settings.SUPABASE_ANON_KEY:
    raise RuntimeError(
        "SUPABASE_ANON_KEY is missing in Render environment variables."
    )


supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY,
)


security = HTTPBearer(auto_error=False)


def get_client_ip(
    request: Request,
) -> Optional[str]:
    forwarded_for = request.headers.get(
        "X-Forwarded-For"
    )

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
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    access_token = credentials.credentials

    try:
        response = supabase.auth.get_user(
            access_token
        )

        supabase_user = response.user

    except Exception as error:
        print(f"Supabase token validation failed: {error}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Could not validate credentials. "
                "Please log in again."
            ),
            headers={
                "WWW-Authenticate": "Bearer"
            },
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
        metadata = (
            supabase_user.user_metadata or {}
        )

        local_user = User(
            name=(
                metadata.get("name")
                or user_email.split("@")[0]
            ),
            email=user_email,
            role=metadata.get("role", "user"),
        )

        db.add(local_user)
        db.commit()
        db.refresh(local_user)

    return local_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:

    role = str(current_user.role).lower()

    if role not in [
        "admin",
        "userrole.admin",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user
