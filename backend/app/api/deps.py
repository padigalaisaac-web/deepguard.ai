import os
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

from app.database.session import get_db
from app.models.user import User


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_ANON_KEY are required."
    )

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
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
    credentials: HTTPAuthorizationCredentials =
        Depends(security),
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

    except Exception:
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
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    user_email = supabase_user.email

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase account email not found.",
        )

    metadata = (
        supabase_user.user_metadata or {}
    )

    local_user = (
        db.query(User)
        .filter(User.email == user_email)
        .first()
    )

    if not local_user:
        local_user = User(
            email=user_email,
            name=(
                metadata.get("name")
                or user_email.split("@")[0]
            ),
            role=metadata.get("role", "user"),
        )

        db.add(local_user)
        db.commit()
        db.refresh(local_user)

    return local_user
