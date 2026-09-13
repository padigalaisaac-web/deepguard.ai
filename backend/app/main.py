from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import init_db
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting DeepGuard backend...")

    try:
        init_db()
        print("Database initialized successfully.")
    except Exception as exc:
        print(f"Database initialization failed: {exc}")

    yield

    print("DeepGuard backend stopped.")


app = FastAPI(
    title=settings.APP_TITLE,
    description=(
        "Enterprise-grade AI deepfake detection "
        "web service for images, videos, and audio."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://deepguard-ai-isaac.onrender.com",
        "https://deepguard-frontend-slrj.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
)

if settings.UPLOAD_DIR.exists():
    app.mount(
        "/uploads",
        StaticFiles(directory=str(settings.UPLOAD_DIR)),
        name="uploads",
    )


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "title": settings.APP_TITLE,
        "tagline": "Detect. Verify. Trust.",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mode": (
            "prototype"
            if settings.DEMO_MODE
            else "production"
        ),
    }


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    print(f"Unhandled server error: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "detail": (
                "Internal server error. "
                "Check Render logs."
            )
        },
    )
