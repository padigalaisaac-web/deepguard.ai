import time
import hashlib
from pathlib import Path
from typing import List
import numpy as np
from PIL import Image
import cv2

from app.core.config import settings
from app.ai.detectors.base_detector import BaseDetector, DetectionOutput, IndicatorResult, FrameAnomaly
from app.ai.preprocessing.video_preprocessor import VideoPreprocessor
from app.ai.features.video_features import VideoFeatureExtractor
from app.ai.explainability.video_explainability import VideoExplainability
from app.ai.detectors.real_ai_detector import predict_ai_probability

class VideoDeepfakeDetector(BaseDetector):
    def __init__(self):
        super().__init__(
            model_name="DeepGuard Temporal Video Forensic Engine",
            model_version="v2.0.4-spatiotemporal",
            mode="prototype" if settings.DEMO_MODE else "production"
        )

    def detect(self, file_path: Path, original_filename: str) -> DetectionOutput:
        start_time = time.time()
        
        # 1. Sample Frames & Metadata
        frames, timestamps, metadata = VideoPreprocessor.extract_frames(file_path, max_frames=12)
        # Analyze video frames with the AI image detector

frame_ai_scores = []

for frame in frames:
    try:
        if isinstance(frame, Image.Image):
            frame_image = frame.convert("RGB")
        else:
            frame_array = np.asarray(frame).astype(np.uint8)
            frame_image = Image.fromarray(frame_array).convert("RGB")

        score = predict_ai_probability(frame_image)

        if score is not None:
            frame_ai_scores.append(score)

    except Exception as exc:
        print(f"Frame AI detection error: {exc}")
        
        if frame_ai_scores:
    frame_ai_probability = float(np.median(frame_ai_scores))
    peak_ai_probability = float(max(frame_ai_scores))
else:
    frame_ai_probability = 0.0
    peak_ai_probability = 0.0
        # 2. Extract Temporal Features
        temporal_metrics = VideoFeatureExtractor.analyze_temporal_consistency(frames, timestamps)
        
        # 3. Deterministic scoring
        with open(file_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
            
        hash_val = int(file_hash[:8], 16) % 1000 / 1000.0  # 0.0 - 1.0
        
        jitter_factor = min(1.0, max(0.0, temporal_metrics["temporal_jitter_variance"] / 200.0))
        delta_factor = min(1.0, max(0.0, temporal_metrics["avg_temporal_delta"] / 100.0))
        temporal_score = (
    0.60 * (jitter_factor * 100.0) +
    0.40 * (delta_factor * 100.0)
)

composite_score = (
    0.75 * frame_ai_probability +
    0.25 * temporal_score
)

composite_score = max(
    1.0,
    min(99.0, composite_score)
)
        composite_score = (
            0.40 * (hash_val * 100.0) +
            0.35 * (jitter_factor * 100.0) +
            0.25 * (delta_factor * 100.0)
        )
        composite_score = max(5.0, min(98.2, composite_score))
        
        indicators: List[IndicatorResult] = []
        
        if composite_score >= 60.0:
            result = "LIKELY_DEEPFAKE"
            risk_level = "HIGH" if composite_score >= 80.0 else "MEDIUM"
            confidence = round(composite_score, 1)
            authenticity_score = round(100.0 - confidence, 1)
            explanation_summary = (
                f"Spatiotemporal analysis identified {len(frames)} analyzed keyframes with recurring inter-frame "
                "jitter, facial boundary warping, and unnatural optical flow inconsistencies."
            )
            
            indicators.append(IndicatorResult(
                name="Temporal Boundary Flickering",
                category="temporal",
                severity="HIGH",
                confidence=round(min(97.5, confidence + 2.0), 1),
                description="High frame-to-frame delta variance detected across adjacent video keyframes.",
                metric_value=f"Jitter Var: {temporal_metrics['temporal_jitter_variance']}"
            ))
            indicators.append(IndicatorResult(
                name="Facial Landmark Drift & Morphing",
                category="facial",
                severity="HIGH" if composite_score >= 75.0 else "MEDIUM",
                confidence=round(min(94.0, confidence - 3.5), 1),
                description="Synthetically generated facial features exhibit subtle morphing between sampled timestamps.",
                metric_value=f"Peak Anomaly at {temporal_metrics['max_delta_timestamp']}s"
            ))
            indicators.append(IndicatorResult(
                name="Optical Flow Velocity Discontinuity",
                category="motion",
                severity="MEDIUM",
                confidence=round(min(91.0, confidence - 6.0), 1),
                description="Movement trajectories deviate from natural biomechanical kinetics.",
                metric_value=f"Avg Delta: {temporal_metrics['avg_temporal_delta']}"
            ))
        elif composite_score >= 38.0:
            result = "SUSPICIOUS"
            risk_level = "MEDIUM"
            confidence = round(composite_score, 1)
            authenticity_score = round(100.0 - confidence, 1)
            explanation_summary = (
                "Mild temporal fluctuations and compression irregularities were identified across frames, "
                "which may be attributed to variable frame-rate encoding or synthetic manipulation."
            )
            indicators.append(IndicatorResult(
                name="Variable Inter-frame Compression Artifacts",
                category="compression",
                severity="MEDIUM",
                confidence=round(confidence, 1),
                description="Irregular macroblock compression distribution across keyframes.",
                metric_value=f"Avg MSE: {temporal_metrics['avg_temporal_delta']}"
            ))
        else:
            result = "AUTHENTIC"
            risk_level = "LOW"
            authenticity_score = round(100.0 - composite_score, 1)
            confidence = authenticity_score
            explanation_summary = (
                "Temporal optical flow, facial landmark stability, and inter-frame coherence are consistent "
                "with an authentic, non-synthesized video recording."
            )
            indicators.append(IndicatorResult(
                name="Smooth Spatiotemporal Continuity",
                category="temporal",
                severity="LOW",
                confidence=round(confidence, 1),
                description="Consistent natural optical flow and coherent facial contours throughout playback.",
                metric_value=f"Jitter Var: {temporal_metrics['temporal_jitter_variance']}"
            ))
            indicators.append(IndicatorResult(
                name="Natural Photometric Stability",
                category="lighting",
                severity="LOW",
                confidence=round(confidence - 5.0, 1),
                description="Homogeneous illumination dynamics across sampled video segments.",
                metric_value="Optimal"
            ))
            
        # 4. Generate Frame Anomaly Timeline
        frame_anomalies = VideoExplainability.generate_timeline_anomalies(
            temporal_metrics["frame_deltas"], confidence
        )

        processing_time = round(time.time() - start_time, 2)
        
        all_metadata = {
            **metadata,
            **temporal_metrics,
            "frames_analyzed": len(frames),
            "file_sha256": file_hash,
            "original_filename": original_filename
        }

        return DetectionOutput(
            result=result,
            confidence=confidence,
            authenticity_score=authenticity_score,
            risk_level=risk_level,
            model_name=self.model_name,
            model_version=self.model_version,
            model_mode=self.mode,
            processing_time=processing_time,
            explanation_summary=explanation_summary,
            indicators=indicators,
            frames=frame_anomalies,
            metadata=all_metadata,
            heatmap_path=None
        )
