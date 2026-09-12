import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Request, Query, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user, get_client_ip
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.analysis import (
    AnalysisUploadResponse, AnalysisDetailOut, AnalysisListResponse,
    AnalysisListItem, IndicatorOut, AnalysisFrameOut, ModelInfo
)
from app.services.analysis_service import AnalysisService
from app.services.pdf_report_service import PDFReportService
from app.core.config import settings

router = APIRouter(prefix="/analysis", tags=["Media Analysis"])

def _format_analysis_detail(analysis: Analysis) -> AnalysisDetailOut:
    metadata_dict = {}
    if analysis.metadata_json:
        try:
            metadata_dict = json.loads(analysis.metadata_json)
        except Exception:
            pass
            
    indicators_out = [
        IndicatorOut(
            id=i.id,
            name=i.name,
            category=i.category,
            severity=i.severity,
            confidence=i.confidence,
            description=i.description,
            metric_value=i.metric_value
        )
        for i in analysis.indicators
    ]
    
    frames_out = [
        AnalysisFrameOut(
            id=f.id,
            timestamp=f.timestamp,
            timestamp_str=f.timestamp_str,
            frame_number=f.frame_number,
            score=f.score,
            anomaly_label=f.anomaly_label,
            severity=f.severity,
            thumbnail_path=f.thumbnail_path
        )
        for f in analysis.frames
    ]
    
    model_info = None
    if analysis.model_name:
        model_info = ModelInfo(
            name=analysis.model_name,
            version=analysis.model_version or "1.0",
            mode=analysis.model_mode or "prototype"
        )
        
    return AnalysisDetailOut(
        id=analysis.id,
        user_id=analysis.user_id,
        filename=analysis.filename,
        original_filename=analysis.original_filename,
        media_type=analysis.media_type,
        file_size=analysis.file_size,
        file_hash=analysis.file_hash,
        status=analysis.status,
        result=analysis.result,
        confidence=analysis.confidence,
        authenticity_score=analysis.authenticity_score,
        risk_level=analysis.risk_level,
        model=model_info,
        processing_time=analysis.processing_time,
        explanation_summary=analysis.explanation_summary,
        metadata=metadata_dict,
        heatmap_url=analysis.heatmap_path,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
        indicators=indicators_out,
        frames=frames_out
    )

@router.post("/upload", response_model=AnalysisUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request) if request else None
    analysis = await AnalysisService.save_uploaded_file(file, current_user, db, ip_address=ip)
    return AnalysisUploadResponse(
        analysis_id=str(analysis.id),
        filename=analysis.filename,
        original_filename=analysis.original_filename,
        media_type=analysis.media_type,
        file_size=analysis.file_size,
        file_hash=analysis.file_hash,
        status=analysis.status,
        created_at=analysis.created_at
    )

@router.post("/{analysis_id}/run", response_model=AnalysisDetailOut)
def run_analysis(
    analysis_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request)
    # Ensure user has access
    AnalysisService.get_analysis_by_id(analysis_id, db, current_user)
    completed_analysis = AnalysisService.execute_analysis(analysis_id, db, ip_address=ip)
    return _format_analysis_detail(completed_analysis)

@router.get("/{analysis_id}", response_model=AnalysisDetailOut)
def get_analysis_detail(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = AnalysisService.get_analysis_by_id(analysis_id, db, current_user)
    return _format_analysis_detail(analysis)

@router.get("", response_model=AnalysisListResponse)
def list_analyses(
    media_type: Optional[str] = Query(None, description="Filter by image, video, audio, or all"),
    result: Optional[str] = Query(None, description="Filter by AUTHENTIC, LIKELY_DEEPFAKE, SUSPICIOUS, or all"),
    search: Optional[str] = Query(None, description="Search by filename or ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items, total = AnalysisService.list_analyses(
        db=db,
        user=current_user,
        media_type=media_type,
        result=result,
        search=search,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    list_items = [
        AnalysisListItem(
            id=item.id,
            original_filename=item.original_filename,
            media_type=item.media_type,
            file_size=item.file_size,
            status=item.status,
            result=item.result,
            confidence=item.confidence,
            risk_level=item.risk_level,
            created_at=item.created_at,
            completed_at=item.completed_at
        )
        for item in items
    ]
    
    return AnalysisListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=list_items
    )

@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ip = get_client_ip(request)
    AnalysisService.delete_analysis(analysis_id, db, current_user, ip_address=ip)
    return {"message": "Analysis record and associated media deleted successfully."}

@router.get("/{analysis_id}/report")
def download_pdf_report(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = AnalysisService.get_analysis_by_id(analysis_id, db, current_user)
    if analysis.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate report for incomplete analysis."
        )
        
    pdf_path = PDFReportService.generate_analysis_report(analysis)
    return FileResponse(
        path=str(pdf_path),
        filename=f"DeepGuard_Forensic_Report_{analysis.id[:8]}.pdf",
        media_type="application/pdf"
    )

@router.get("/heatmaps/{filename}")
def get_heatmap_file(filename: str):
    file_path = settings.HEATMAPS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Heatmap image not found.")
    return FileResponse(str(file_path), media_type="image/png")

@router.get("/media/{filename}")
def get_media_preview(filename: str):
    file_path = settings.UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media file not found.")
    # Content type guess
    ext = file_path.suffix.lower()
    media_map = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
        ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
        ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".flac": "audio/flac"
    }
    return FileResponse(str(file_path), media_type=media_map.get(ext, "application/octet-stream"))
