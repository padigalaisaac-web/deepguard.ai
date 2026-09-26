from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole
from app.models.analysis import MediaType, AnalysisStatus, DetectionResult, RiskLevel

class AdminUserItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    analysis_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class AdminAuditLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    analysis_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

class SystemHealth(BaseModel):
    status: str
    database_connected: bool
    ai_engine_status: str
    ai_engine_mode: str
    storage_used_mb: float
    total_uploads: int
    timestamp: datetime
