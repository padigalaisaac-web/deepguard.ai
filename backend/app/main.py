from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import init_db
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.APP_TITLE,
    description="Enterprise-grade AI deepfake detection web service.",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://deepguard-ai-ghj8.onrender.com",
        "https://deepguard-frontend-slrj.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(
    api_router,
    prefix=settings.API_V1_STR
)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "title": settings.APP_TITLE,
        "tagline": "Detect. Verify. Trust.",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mode": "prototype" if settings.DEMO_MODE else "production"
    }
