from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class AnalysisFrame(Base):
    __tablename__ = "analysis_frames"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(Float, nullable=False)  # in seconds (e.g. 12.4)
    timestamp_str = Column(String(20), nullable=True)  # "00:12"
    frame_number = Column(Integer, nullable=True)
    score = Column(Float, nullable=False)  # Anomaly score 0.0 to 100.0
    anomaly_label = Column(String(100), nullable=True)  # "Facial boundary jitter", "High spectral artifact"
    severity = Column(String(20), default="MEDIUM")
    thumbnail_path = Column(String(255), nullable=True)

    # Relationships
    analysis = relationship("Analysis", back_populates="frames")
