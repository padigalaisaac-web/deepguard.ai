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
    """
    Initialize the database when the application starts.
    """
    try:
        init_db()
        print("Database initialized successfully.")
    except Exception as exc:
        print(f"Database initialization failed: {exc}")
        raise

    yield


app = FastAPI(
    title=settings.APP_TITLE,
    description=(
        "Enterprise-grade AI deepfake detection web service "
        "for images, videos, and audio."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routes
app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
)


# Serve uploaded files
if settings.UPLOAD_DIR.exists():
    app.mount(
        "/uploads",
        StaticFiles(
            directory=str(settings.UPLOAD_DIR)
        ),
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
            "detail": "An unexpected server error occurred."
        },
    )
