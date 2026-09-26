from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from supabase import create_client, Client

from app.core.config import settings
from app.core.security import create_access_token
from app.database.session import get_db
from app.api.deps import get_current_user, get_client_ip
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.user import UserOut, UserUpdate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

supabase: Optional[Client] = None
if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    except Exception as exc:
        print(f"Supabase client initialization skipped: {exc}")


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    request: Request = None,
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request) if request else None

    # Check if user already exists locally
    existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    supabase_token = None
    if supabase is not None:
        try:
            response = supabase.auth.sign_up({
                "email": data.email,
                "password": data.password,
                "options": {
                    "data": {
                        "name": data.name,
                        "role": "user"
                    }
                }
            })
            if response and response.session:
                supabase_token = response.session.access_token
        except Exception:
            pass

    user = AuthService.register_user(db, data, ip_address=ip)
    access_token = supabase_token or create_access_token(user.id)

    return {
        "message": "Registration successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user).model_dump()
    }


@router.post("/login")
async def login(
    data: LoginRequest,
    request: Request = None,
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request) if request else None

    # 1. Try local authentication first (seeded users, admin, tests)
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if user and user.password_hash and user.password_hash != "SUPABASE_AUTH_USER":
        try:
            authenticated_user = AuthService.authenticate_user(db, data, ip_address=ip)
            access_token = create_access_token(authenticated_user.id)
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": UserOut.model_validate(authenticated_user).model_dump()
            }
        except HTTPException as he:
            if he.status_code == status.HTTP_403_FORBIDDEN:
                raise

    # 2. Try Supabase authentication
    if supabase is not None:
        try:
            response = supabase.auth.sign_in_with_password({
                "email": data.email,
                "password": data.password
            })
            if response and response.session:
                user_email = response.user.email
                local_user = db.query(User).filter(User.email == user_email).first()
                if not local_user:
                    metadata = response.user.user_metadata or {}
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
                        detail="This account has been disabled."
                    )

                return {
                    "access_token": response.session.access_token,
                    "token_type": "bearer",
                    "user": UserOut.model_validate(local_user).model_dump()
                }
        except HTTPException:
            raise
        except Exception:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password."
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AuthService.update_profile(
        db=db,
        user=current_user,
        name=data.name,
        password=data.password
    )


@router.post("/logout")
def logout():
    return {
        "message": "Logout successful."
    }
