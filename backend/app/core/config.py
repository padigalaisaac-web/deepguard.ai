import os
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"
REPORTS_DIR = BASE_DIR / "reports"
HEATMAPS_DIR = UPLOAD_DIR / "heatmaps"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore",
    )

    PROJECT_NAME: str = "DeepGuard"
    APP_TITLE: str = "DeepGuard AI — Deepfake Detection System"
    API_V1_STR: str = "/api"

    SECRET_KEY: str = "change-this-secret-key-in-render"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/deepguard.db"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    # Storage
    UPLOAD_DIR: Path = UPLOAD_DIR
    REPORTS_DIR: Path = REPORTS_DIR
    HEATMAPS_DIR: Path = HEATMAPS_DIR

    # File limits
    MAX_FILE_SIZE_MB: int = 100

    ALLOWED_IMAGE_EXTENSIONS: List[str] = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ]

    ALLOWED_VIDEO_EXTENSIONS: List[str] = [
        ".mp4",
        ".mov",
        ".avi",
        ".webm",
    ]

    ALLOWED_AUDIO_EXTENSIONS: List[str] = [
        ".mp3",
        ".wav",
        ".m4a",
        ".flac",
    ]

    # AI
    MODEL_PATH: str = str(BASE_DIR / "models")
    DEMO_MODE: bool = True
    DEFAULT_MODEL_NAME: str = "DeepGuard Multi-Modal Forensic Engine"
    DEFAULT_MODEL_VERSION: str = "v1.2.0-forensic"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://deepguard-ai-isaac.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
os.makedirs(settings.HEATMAPS_DIR, exist_ok=True)
