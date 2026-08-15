from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User, UserRole
from app.models.analysis import Analysis, DetectionResult, MediaType, RiskLevel, AnalysisStatus
from app.schemas.dashboard import DashboardStats, DashboardTrends, TrendPoint, DistributionItem

class DashboardService:
    @staticmethod
    def get_stats(db: Session, user: User) -> DashboardStats:
        query = db.query(Analysis)
        if user.role != UserRole.ADMIN:
            query = query.filter(Analysis.user_id == user.id)
            
        total = query.count()
        authentic = query.filter(Analysis.result == DetectionResult.AUTHENTIC).count()
        deepfake = query.filter(Analysis.result == DetectionResult.LIKELY_DEEPFAKE).count()
        suspicious = query.filter(Analysis.result == DetectionResult.SUSPICIOUS).count()
        
        avg_conf_query = query.filter(Analysis.confidence.isnot(None)).with_entities(func.avg(Analysis.confidence)).scalar()
        avg_confidence = round(float(avg_conf_query), 1) if avg_conf_query is not None else 0.0
        
        # Recent 7 days activity count
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_count = query.filter(Analysis.created_at >= seven_days_ago).count()
        
        return DashboardStats(
            total_analyses=total,
            authentic_count=authentic,
            deepfake_count=deepfake,
            suspicious_count=suspicious,
            average_confidence=avg_confidence,
            recent_activity_count=recent_count
        )

    @staticmethod
    def get_trends(db: Session, user: User, days: int = 14) -> DashboardTrends:
        query = db.query(Analysis)
        if user.role != UserRole.ADMIN:
            query = query.filter(Analysis.user_id == user.id)
            
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=days)
        
        analyses = query.filter(Analysis.created_at >= start_date).all()
        
        # Build date buckets
        date_map: Dict[str, Dict[str, int]] = {}
        for i in range(days + 1):
            d = (start_date + timedelta(days=i)).strftime("%b %d")
            date_map[d] = {"total": 0, "deepfake": 0, "authentic": 0, "suspicious": 0}
            
        for a in analyses:
            d_str = a.created_at.strftime("%b %d") if a.created_at else None
            if d_str and d_str in date_map:
                date_map[d_str]["total"] += 1
                if a.result == DetectionResult.LIKELY_DEEPFAKE:
                    date_map[d_str]["deepfake"] += 1
                elif a.result == DetectionResult.AUTHENTIC:
                    date_map[d_str]["authentic"] += 1
                elif a.result == DetectionResult.SUSPICIOUS:
                    date_map[d_str]["suspicious"] += 1
                    
        trend_points: List[TrendPoint] = [
            TrendPoint(
                date=k,
                total=v["total"],
                deepfake=v["deepfake"],
                authentic=v["authentic"],
                suspicious=v["suspicious"]
            )
            for k, v in date_map.items()
        ]
        
        # Media type distribution
        img_cnt = query.filter(Analysis.media_type == MediaType.IMAGE).count()
        vid_cnt = query.filter(Analysis.media_type == MediaType.VIDEO).count()
        aud_cnt = query.filter(Analysis.media_type == MediaType.AUDIO).count()
        total_media = max(1, img_cnt + vid_cnt + aud_cnt)
        
        media_dist: List[DistributionItem] = [
            DistributionItem(name="Images", value=img_cnt, percentage=round(img_cnt / total_media * 100, 1)),
            DistributionItem(name="Videos", value=vid_cnt, percentage=round(vid_cnt / total_media * 100, 1)),
            DistributionItem(name="Audio", value=aud_cnt, percentage=round(aud_cnt / total_media * 100, 1)),
        ]
        
        # Risk level distribution
        low_cnt = query.filter(Analysis.risk_level == RiskLevel.LOW).count()
        med_cnt = query.filter(Analysis.risk_level == RiskLevel.MEDIUM).count()
        high_cnt = query.filter(Analysis.risk_level == RiskLevel.HIGH).count()
        crit_cnt = query.filter(Analysis.risk_level == RiskLevel.CRITICAL).count()
        total_risk = max(1, low_cnt + med_cnt + high_cnt + crit_cnt)
        
        risk_dist: List[DistributionItem] = [
            DistributionItem(name="Low Risk", value=low_cnt, percentage=round(low_cnt / total_risk * 100, 1)),
            DistributionItem(name="Medium Risk", value=med_cnt, percentage=round(med_cnt / total_risk * 100, 1)),
            DistributionItem(name="High Risk", value=high_cnt, percentage=round(high_cnt / total_risk * 100, 1)),
            DistributionItem(name="Critical Risk", value=crit_cnt, percentage=round(crit_cnt / total_risk * 100, 1)),
        ]
        
        return DashboardTrends(
            trends=trend_points,
            media_distribution=media_dist,
            risk_distribution=risk_dist
        )
