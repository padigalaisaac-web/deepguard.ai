import os
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from supabase import Client, create_client

from app.database.session import get_db
from app.models.user import User


# Supabase configuration
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


# Read Bearer token from request headers
security = HTTPBearer(auto_error=False)


def get_client_ip(request: Request) -> Optional[str]:
    """
    Get the client's IP address.
    """
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
    """
    Validate the Supabase access token and return
    the matching local DeepGuard user.
    """

    # Check whether Authorization header exists
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is missing.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    access_token = credentials.credentials.strip()

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is empty.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # Validate token with Supabase
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
            detail="Supabase user was not found.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    user_email = supabase_user.email

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase account email was not found.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    user_email = user_email.lower().strip()

    # Search for the local DeepGuard user
    local_user = (
        db.query(User)
        .filter(User.email == user_email)
        .first()
    )

    # Create a local user if not found
    if local_user is None:
        metadata = supabase_user.user_metadata or {}

        local_user = User(
            email=user_email,
            name=(
                metadata.get("name")
                or user_email.split("@")[0]
            ),
            role=metadata.get("role", "user"),
        )

        try:
            db.add(local_user)
            db.commit()
            db.refresh(local_user)

        except SQLAlchemyError:
            db.rollback()

            # Another request may have created the user
            local_user = (
                db.query(User)
                .filter(User.email == user_email)
                .first()
            )

            if local_user is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not create local user.",
                )

    return local_user
