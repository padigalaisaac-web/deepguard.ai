import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from supabase import create_client, Client


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError(
        "Supabase environment variables are missing."
    )

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
)

security = HTTPBearer()


async def get_current_user(
    credentials=Depends(security)
):
    token = credentials.credentials

    try:
        response = supabase.auth.get_user(token)
        user = response.user

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials"
            )

        return user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials"
        )
