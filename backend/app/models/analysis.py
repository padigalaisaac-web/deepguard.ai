import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base

class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"

class AnalysisStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class DetectionResult(str, enum.Enum):
    AUTHENTIC = "AUTHENTIC"
    LIKELY_DEEPFAKE = "LIKELY_DEEPFAKE"
    SUSPICIOUS = "SUSPICIOUS"

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, index=True)  # UUID string
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)  # Internal stored filename
    original_filename = Column(String(255), nullable=False)
    media_type = Column(Enum(MediaType), nullable=False, index=True)
    file_size = Column(Integer, nullable=False)  # in bytes
    file_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False, index=True)
    result = Column(Enum(DetectionResult), nullable=True, index=True)
    confidence = Column(Float, nullable=True)  # 0.0 to 100.0
    authenticity_score = Column(Float, nullable=True)  # 0.0 to 100.0
    risk_level = Column(Enum(RiskLevel), nullable=True)
    model_name = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    model_mode = Column(String(50), default="prototype", nullable=True)
    processing_time = Column(Float, nullable=True)  # in seconds
    explanation_summary = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON string with resolution, fps, bitrate, audio channels, etc.
    heatmap_path = Column(String(255), nullable=True)  # relative path to explainability heatmap or thumbnail
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="analyses")
    indicators = relationship("Indicator", back_populates="analysis", cascade="all, delete-orphan")
    frames = relationship("AnalysisFrame", back_populates="analysis", cascade="all, delete-orphan")
