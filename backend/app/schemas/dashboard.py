from typing import List, Dict, Any
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_analyses: int
    authentic_count: int
    deepfake_count: int
    suspicious_count: int
    average_confidence: float
    recent_activity_count: int

class TrendPoint(BaseModel):
    date: str
    total: int
    deepfake: int
    authentic: int
    suspicious: int

class DistributionItem(BaseModel):
    name: str
    value: int
    percentage: float

class DashboardTrends(BaseModel):
    trends: List[TrendPoint]
    media_distribution: List[DistributionItem]
    risk_distribution: List[DistributionItem]
