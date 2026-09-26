from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict
from app.models.analysis import MediaType, AnalysisStatus, DetectionResult, RiskLevel

class IndicatorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: Optional[int] = None
    name: str
    category: Optional[str] = None
    severity: str
    confidence: float
    description: str
    metric_value: Optional[str] = None

class AnalysisFrameOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: Optional[int] = None
    timestamp: float
    timestamp_str: Optional[str] = None
    frame_number: Optional[int] = None
    score: float
    anomaly_label: Optional[str] = None
    severity: Optional[str] = "MEDIUM"
    thumbnail_path: Optional[str] = None

class ModelInfo(BaseModel):
    name: str
    version: str
    mode: str

class AnalysisUploadResponse(BaseModel):
    analysis_id: str
    filename: str
    original_filename: str
    media_type: MediaType
    file_size: int
    file_hash: str
    status: AnalysisStatus
    created_at: datetime

class AnalysisDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: int
    filename: str
    original_filename: str
    media_type: MediaType
    file_size: int
    file_hash: str
    status: AnalysisStatus
    result: Optional[DetectionResult] = None
    confidence: Optional[float] = None
    authenticity_score: Optional[float] = None
    risk_level: Optional[RiskLevel] = None
    model: Optional[ModelInfo] = None
    processing_time: Optional[float] = None
    explanation_summary: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    heatmap_url: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    indicators: List[IndicatorOut] = []
    frames: List[AnalysisFrameOut] = []

class AnalysisListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    original_filename: str
    media_type: MediaType
    file_size: int
    status: AnalysisStatus
    result: Optional[DetectionResult] = None
    confidence: Optional[float] = None
    risk_level: Optional[RiskLevel] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

class AnalysisListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[AnalysisListItem]
