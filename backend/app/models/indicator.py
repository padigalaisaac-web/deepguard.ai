import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base

class IndicatorSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=True)  # e.g., "spatial", "frequency", "temporal", "spectral"
    severity = Column(String(20), nullable=False)
    confidence = Column(Float, nullable=False)  # 0.0 to 100.0
    description = Column(Text, nullable=False)
    metric_value = Column(String(100), nullable=True)

    # Relationships
    analysis = relationship("Analysis", back_populates="indicators")
