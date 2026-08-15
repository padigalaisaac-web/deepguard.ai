import os
import json
import uuid
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.models.user import User, UserRole
from app.models.analysis import Analysis, MediaType, AnalysisStatus, DetectionResult, RiskLevel
from app.models.indicator import Indicator
from app.models.analysis_frame import AnalysisFrame
from app.models.audit_log import AuditLog
from app.ai.detectors.demo_detector import DemoDetectorFactory

class AnalysisService:
    @staticmethod
    def determine_media_type(filename: str, content_type: Optional[str] = None) -> MediaType:
        ext = Path(filename).suffix.lower()
        if ext in settings.ALLOWED_IMAGE_EXTENSIONS or (content_type and "image" in content_type):
            return MediaType.IMAGE
        elif ext in settings.ALLOWED_VIDEO_EXTENSIONS or (content_type and "video" in content_type):
            return MediaType.VIDEO
        elif ext in settings.ALLOWED_AUDIO_EXTENSIONS or (content_type and "audio" in content_type):
            return MediaType.AUDIO
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This file type is not supported. Please upload JPG, PNG, WEBP, MP4, MOV, WAV, MP3 or another supported format."
            )

    @staticmethod
    async def save_uploaded_file(file: UploadFile, user: User, db: Session, ip_address: Optional[str] = None) -> Analysis:
        # Check size & extension
        media_type = AnalysisService.determine_media_type(file.filename, file.content_type)
        
        file_ext = Path(file.filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        safe_filename = f"{unique_id}{file_ext}"
        saved_path = settings.UPLOAD_DIR / safe_filename
        
        # Read content and compute SHA-256
        sha256 = hashlib.sha256()
        total_size = 0
        
        with open(saved_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                total_size += len(chunk)
                if total_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                    # Clean up
                    if saved_path.exists():
                        saved_path.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"The uploaded file exceeds the maximum allowed size ({settings.MAX_FILE_SIZE_MB}MB)."
                    )
                sha256.update(chunk)
                f.write(chunk)
                
        file_hash = sha256.hexdigest()
        
        # Create Analysis DB Record
        analysis = Analysis(
            id=unique_id,
            user_id=user.id,
            filename=safe_filename,
            original_filename=file.filename or "media_upload",
            media_type=media_type,
            file_size=total_size,
            file_hash=file_hash,
            status=AnalysisStatus.PENDING
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # Audit Log
        audit = AuditLog(
            user_id=user.id,
            action="UPLOAD_MEDIA",
            analysis_id=analysis.id,
            details=f"Uploaded {file.filename} ({media_type.value}, {total_size} bytes)",
            ip_address=ip_address
        )
        db.add(audit)
        db.commit()
        
        return analysis

    @staticmethod
    def execute_analysis(analysis_id: str, db: Session, ip_address: Optional[str] = None) -> Analysis:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")
            
        file_path = settings.UPLOAD_DIR / analysis.filename
        if not file_path.exists():
            analysis.status = AnalysisStatus.FAILED
            db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Media file not found on server.")
            
        analysis.status = AnalysisStatus.PROCESSING
        db.commit()
        
        try:
            detector = DemoDetectorFactory.get_detector(analysis.media_type.value)
            output = detector.detect(file_path, analysis.original_filename)
            
            # Map results to model
            analysis.result = DetectionResult(output.result)
            analysis.confidence = output.confidence
            analysis.authenticity_score = output.authenticity_score
            analysis.risk_level = RiskLevel(output.risk_level)
            analysis.model_name = output.model_name
            analysis.model_version = output.model_version
            analysis.model_mode = output.model_mode
            analysis.processing_time = output.processing_time
            analysis.explanation_summary = output.explanation_summary
            analysis.metadata_json = json.dumps(output.metadata, default=str)
            analysis.heatmap_path = output.heatmap_path
            analysis.status = AnalysisStatus.COMPLETED
            analysis.completed_at = datetime.now(timezone.utc)
            
            # Save Indicators
            for ind in output.indicators:
                indicator = Indicator(
                    analysis_id=analysis.id,
                    name=ind.name,
                    category=ind.category,
                    severity=ind.severity,
                    confidence=ind.confidence,
                    description=ind.description,
                    metric_value=ind.metric_value
                )
                db.add(indicator)
                
            # Save Frames
            for fr in output.frames:
                frame = AnalysisFrame(
                    analysis_id=analysis.id,
                    timestamp=fr.timestamp,
                    timestamp_str=fr.timestamp_str,
                    frame_number=fr.frame_number,
                    score=fr.score,
                    anomaly_label=fr.anomaly_label,
                    severity=fr.severity,
                    thumbnail_path=fr.thumbnail_path
                )
                db.add(frame)
                
            # Audit log
            audit = AuditLog(
                user_id=analysis.user_id,
                action="RUN_ANALYSIS",
                analysis_id=analysis.id,
                details=f"Analysis completed: result={output.result}, confidence={output.confidence}%",
                ip_address=ip_address
            )
            db.add(audit)
            db.commit()
            db.refresh(analysis)
            
            return analysis
        except Exception as e:
            db.rollback()
            analysis.status = AnalysisStatus.FAILED
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"We could not complete the analysis. Please try again. ({str(e)})"
            )

    @staticmethod
    def get_analysis_by_id(analysis_id: str, db: Session, user: User) -> Analysis:
        query = db.query(Analysis).filter(Analysis.id == analysis_id)
        # If not admin, restrict to owner
        if user.role != UserRole.ADMIN:
            query = query.filter(Analysis.user_id == user.id)
            
        analysis = query.first()
        if not analysis:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")
        return analysis

    @staticmethod
    def list_analyses(
        db: Session,
        user: User,
        media_type: Optional[str] = None,
        result: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Analysis], int]:
        query = db.query(Analysis)
        
        # RBAC: normal users only see their own analyses
        if user.role != UserRole.ADMIN:
            query = query.filter(Analysis.user_id == user.id)
            
        if media_type and media_type.lower() != "all":
            query = query.filter(Analysis.media_type == media_type.lower())
            
        if result and result.upper() != "ALL":
            query = query.filter(Analysis.result == result.upper())
            
        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Analysis.original_filename.ilike(search_term),
                    Analysis.id.ilike(search_term),
                    Analysis.file_hash.ilike(search_term)
                )
            )
            
        total = query.count()
        
        # Sorting
        order_col = getattr(Analysis, sort_by, Analysis.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(order_col))
        else:
            query = query.order_by(desc(order_col))
            
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def delete_analysis(analysis_id: str, db: Session, user: User, ip_address: Optional[str] = None) -> bool:
        analysis = AnalysisService.get_analysis_by_id(analysis_id, db, user)
        
        # Remove uploaded file if exists
        saved_path = settings.UPLOAD_DIR / analysis.filename
        if saved_path.exists():
            try:
                saved_path.unlink()
            except Exception:
                pass
                
        # Remove report if exists
        report_path = settings.REPORTS_DIR / f"DeepGuard_Forensic_Report_{analysis.id[:8]}.pdf"
        if report_path.exists():
            try:
                report_path.unlink()
            except Exception:
                pass
                
        audit = AuditLog(
            user_id=user.id,
            action="DELETE_ANALYSIS",
            analysis_id=analysis.id,
            details=f"Deleted analysis {analysis.id} for {analysis.original_filename}",
            ip_address=ip_address
        )
        db.add(audit)
        
        db.delete(analysis)
        db.commit()
        return True
