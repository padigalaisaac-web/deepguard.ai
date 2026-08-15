import os
import json
import uuid
from datetime import datetime, timedelta, timezone
from PIL import Image, ImageDraw
import numpy as np

from app.database.session import SessionLocal, init_db
from app.models.user import User, UserRole
from app.models.analysis import Analysis, MediaType, AnalysisStatus, DetectionResult, RiskLevel
from app.models.indicator import Indicator
from app.models.analysis_frame import AnalysisFrame
from app.core.config import settings

def create_dummy_sample_images():
    """Generates test images in uploads for initial seed records"""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.HEATMAPS_DIR, exist_ok=True)
    
    # 1. Sample image 1
    p1 = settings.UPLOAD_DIR / "sample_portrait_01.jpg"
    if not p1.exists():
        im = Image.new("RGB", (400, 400), color=(120, 140, 160))
        draw = ImageDraw.Draw(im)
        draw.ellipse((100, 80, 300, 320), fill=(210, 180, 150), outline=(50, 50, 50))
        draw.ellipse((140, 140, 170, 170), fill=(40, 40, 40))
        draw.ellipse((230, 140, 260, 170), fill=(40, 40, 40))
        draw.arc((160, 220, 240, 260), start=0, end=180, fill=(150, 50, 50), width=4)
        im.save(p1, format="JPEG")
        
    # 2. Sample image 2
    p2 = settings.UPLOAD_DIR / "sample_interview_frame.png"
    if not p2.exists():
        im2 = Image.new("RGB", (400, 400), color=(30, 40, 60))
        draw2 = ImageDraw.Draw(im2)
        draw2.rectangle((50, 50, 350, 350), fill=(70, 90, 120))
        draw2.text((80, 180), "DeepGuard Verification Frame", fill=(255, 255, 255))
        im2.save(p2, format="PNG")

def seed_sample_analyses():
    init_db()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "user@deepguard.ai").first()
        admin = db.query(User).filter(User.email == "admin@deepguard.ai").first()
        if not user:
            return
            
        create_dummy_sample_images()
        
        # Check if already seeded with sample analyses
        existing_count = db.query(Analysis).count()
        if existing_count > 3:
            print("Database already contains analysis records.")
            return

        now = datetime.now(timezone.utc)
        
        # Sample 1: High Risk Deepfake Video
        a1 = Analysis(
            id=str(uuid.uuid4()),
            user_id=user.id,
            filename="sample_interview_frame.png",
            original_filename="presidential_press_conference_clip.mp4",
            media_type=MediaType.VIDEO,
            file_size=18452100,
            file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            status=AnalysisStatus.COMPLETED,
            result=DetectionResult.LIKELY_DEEPFAKE,
            confidence=94.7,
            authenticity_score=5.3,
            risk_level=RiskLevel.HIGH,
            model_name="DeepGuard Temporal Video Forensic Engine",
            model_version="v2.0.4-spatiotemporal",
            model_mode="prototype",
            processing_time=11.4,
            explanation_summary="Spatiotemporal analysis identified recurring inter-frame facial boundary warping and unnatural optical flow inconsistencies across sampled keyframes.",
            metadata_json=json.dumps({"fps": 30.0, "duration_seconds": 18.5, "resolution": "1920x1080", "frames_analyzed": 16}),
            created_at=now - timedelta(days=2, hours=3),
            completed_at=now - timedelta(days=2, hours=3) + timedelta(seconds=11)
        )
        db.add(a1)
        
        # Indicators for A1
        db.add(Indicator(
            analysis_id=a1.id,
            name="Facial Boundary Temporal Flickering",
            category="temporal",
            severity="HIGH",
            confidence=96.8,
            description="High variance in pixel delta detected around jawline and ear regions across frame sequences.",
            metric_value="Jitter Var: 142.8"
        ))
        db.add(Indicator(
            analysis_id=a1.id,
            name="Generative Diffusion Grid Artifact",
            category="frequency",
            severity="HIGH",
            confidence=93.2,
            description="Periodic frequency spikes detected in 2D FFT spectral transformation.",
            metric_value="FFT Ratio: 0.084"
        ))
        db.add(Indicator(
            analysis_id=a1.id,
            name="Unnatural Eye Blink Kinetics",
            category="facial",
            severity="MEDIUM",
            confidence=89.5,
            description="Blink frequency and eyelid closure velocity deviate from biological baselines.",
            metric_value="Closure Rate: 42ms"
        ))
        
        # Frames for A1
        db.add(AnalysisFrame(analysis_id=a1.id, timestamp=3.2, timestamp_str="00:03", frame_number=96, score=91.4, anomaly_label="Facial boundary warping at jawline", severity="HIGH"))
        db.add(AnalysisFrame(analysis_id=a1.id, timestamp=7.5, timestamp_str="00:07", frame_number=225, score=96.7, anomaly_label="Lip-sync phonetic phase misalignment", severity="HIGH"))
        db.add(AnalysisFrame(analysis_id=a1.id, timestamp=12.1, timestamp_str="00:12", frame_number=363, score=88.2, anomaly_label="Lighting specular highlight mismatch on pupil", severity="MEDIUM"))
        db.add(AnalysisFrame(analysis_id=a1.id, timestamp=16.8, timestamp_str="00:16", frame_number=504, score=94.5, anomaly_label="Inter-frame macroblock blend distortion", severity="HIGH"))

        # Sample 2: Authentic Portrait Image
        a2 = Analysis(
            id=str(uuid.uuid4()),
            user_id=user.id,
            filename="sample_portrait_01.jpg",
            original_filename="executive_id_portrait.jpg",
            media_type=MediaType.IMAGE,
            file_size=3240500,
            file_hash="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            status=AnalysisStatus.COMPLETED,
            result=DetectionResult.AUTHENTIC,
            confidence=92.1,
            authenticity_score=92.1,
            risk_level=RiskLevel.LOW,
            model_name="DeepGuard Vision Forensic Ensemble",
            model_version="v2.1.0-spatial-frequency",
            model_mode="prototype",
            processing_time=3.2,
            explanation_summary="The analysis found uniform Error Level Analysis (ELA) degradation, natural frequency distributions, and coherent pixel boundaries consistent with authentic photography.",
            metadata_json=json.dumps({"width": 2400, "height": 3000, "format": "JPEG", "has_exif": True, "camera_make": "Canon", "camera_model": "EOS R5"}),
            created_at=now - timedelta(days=1, hours=6),
            completed_at=now - timedelta(days=1, hours=6) + timedelta(seconds=3)
        )
        db.add(a2)
        
        db.add(Indicator(
            analysis_id=a2.id,
            name="Harmonic Frequency Distribution",
            category="frequency",
            severity="LOW",
            confidence=92.1,
            description="Continuous organic 1/f spectral decay without synthetic high-frequency grid attenuation.",
            metric_value="FFT Var: 24.1"
        ))
        db.add(Indicator(
            analysis_id=a2.id,
            name="Uniform Compression Matrix",
            category="compression",
            severity="LOW",
            confidence=89.4,
            description="Error Level Analysis confirms homogenous JPEG compression quantization table throughout the image.",
            metric_value="ELA StdDev: 1.2"
        ))

        # Sample 3: Suspicious Audio Recording
        a3 = Analysis(
            id=str(uuid.uuid4()),
            user_id=user.id,
            filename="sample_interview_frame.png",
            original_filename="voicemail_authorization_request.wav",
            media_type=MediaType.AUDIO,
            file_size=4210000,
            file_hash="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            status=AnalysisStatus.COMPLETED,
            result=DetectionResult.SUSPICIOUS,
            confidence=54.2,
            authenticity_score=45.8,
            risk_level=RiskLevel.MEDIUM,
            model_name="DeepGuard Acoustic Spectral Forensic Engine",
            model_version="v1.8.2-vocoder-spectral",
            model_mode="prototype",
            processing_time=4.8,
            explanation_summary="Acoustic features display mild phase and spectral irregularities that could stem from aggressive noise-reduction transcoding or partial voice cloning.",
            metadata_json=json.dumps({"duration_seconds": 24.2, "sample_rate": 44100, "channels": 1, "format": "WAV"}),
            created_at=now - timedelta(hours=14),
            completed_at=now - timedelta(hours=14) + timedelta(seconds=5)
        )
        db.add(a3)
        
        db.add(Indicator(
            analysis_id=a3.id,
            name="High-Frequency Bandwidth Limitation",
            category="spectral",
            severity="MEDIUM",
            confidence=58.1,
            description="Acoustic cutoff observed above 7.8kHz; typical of telecommunication compression or synthetic bandwidth extension.",
            metric_value="Flatness: 0.28"
        ))
        
        db.add(AnalysisFrame(analysis_id=a3.id, timestamp=4.0, timestamp_str="00:04–00:07", frame_number=1, score=62.5, anomaly_label="Formant modulation irregularity in vowel phoneme", severity="MEDIUM"))
        db.add(AnalysisFrame(analysis_id=a3.id, timestamp=14.0, timestamp_str="00:14–00:17", frame_number=4, score=56.0, anomaly_label="Acoustic background ambient phase shift", severity="LOW"))

        db.commit()
        print("Successfully seeded sample analysis records!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding sample analyses: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_sample_analyses()
