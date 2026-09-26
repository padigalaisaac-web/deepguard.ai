from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Dict, Any, Optional

@dataclass
class IndicatorResult:
    name: str
    category: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float  # 0.0 - 100.0
    description: str
    metric_value: Optional[str] = None

@dataclass
class FrameAnomaly:
    timestamp: float
    timestamp_str: str
    frame_number: int
    score: float  # 0.0 - 100.0
    anomaly_label: str
    severity: str = "MEDIUM"
    thumbnail_path: Optional[str] = None

@dataclass
class DetectionOutput:
    result: str  # AUTHENTIC, LIKELY_DEEPFAKE, SUSPICIOUS
    confidence: float  # 0.0 - 100.0
    authenticity_score: float  # 0.0 - 100.0
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    model_name: str
    model_version: str
    model_mode: str  # prototype or real
    processing_time: float
    explanation_summary: str
    indicators: List[IndicatorResult] = field(default_factory=list)
    frames: List[FrameAnomaly] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    heatmap_path: Optional[str] = None

class BaseDetector(ABC):
    def __init__(self, model_name: str, model_version: str, mode: str = "prototype"):
        self.model_name = model_name
        self.model_version = model_version
        self.mode = mode

    @abstractmethod
    def detect(self, file_path: Path, original_filename: str) -> DetectionOutput:
        """
        Execute detection on the media file.
        Must return DetectionOutput.
        """
        pass
