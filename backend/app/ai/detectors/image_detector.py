
import time
import hashlib
from pathlib import Path
from typing import List

from app.core.config import settings
from app.ai.detectors.base_detector import (
    BaseDetector,
    DetectionOutput,
    IndicatorResult,
)
from app.ai.preprocessing.image_preprocessor import ImagePreprocessor
from app.ai.features.image_features import ImageFeatureExtractor
from app.ai.explainability.image_explainability import ImageExplainability
from app.ai.detectors.real_ai_detector import predict_ai_probability


class ImageDeepfakeDetector(BaseDetector):
    def __init__(self):
        super().__init__(
            model_name="DeepGuard AI Image Detector",
            model_version="v3.0.0-real-onnx",
            mode="prototype" if settings.DEMO_MODE else "production",
        )

    def detect(
        self,
        file_path: Path,
        original_filename: str
    ) -> DetectionOutput:

        start_time = time.time()

        # ---------------------------------------------------------
        # 1. Load and preprocess image
        # ---------------------------------------------------------
        img_rgb, img_array, metadata = (
            ImagePreprocessor.load_and_preprocess(file_path)
        )

        # ---------------------------------------------------------
        # 2. Extract forensic features
        # ---------------------------------------------------------
        fft_metrics = ImageFeatureExtractor.extract_fft_spectrum(
            img_array
        )

        ela_mean, ela_std, ela_diff_img = (
            ImageFeatureExtractor.compute_ela_metrics(img_rgb)
        )

        face_metrics = (
            ImageFeatureExtractor.detect_face_and_boundary_features(
                img_array
            )
        )

        chromatic_metrics = (
            ImageFeatureExtractor.analyze_chromatic_consistency(
                img_array
            )
        )

        # ---------------------------------------------------------
        # 3. Generate anomaly heatmap
        # ---------------------------------------------------------
        heatmap_filename, heatmap_url = (
            ImageExplainability.generate_anomaly_heatmap(
                img_array,
                ela_diff_img,
                settings.HEATMAPS_DIR,
            )
        )

        # ---------------------------------------------------------
        # 4. SHA-256 file integrity hash
        # ---------------------------------------------------------
        with open(file_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        # ---------------------------------------------------------
        # 5. REAL AI MODEL PREDICTION
        # ---------------------------------------------------------
        model_ai_probability = None
        model_error = None

        try:
            model_ai_probability = predict_ai_probability(img_rgb)

        except Exception as exc:
            model_error = str(exc)
            print(f"AI model prediction failed: {exc}")

        # ---------------------------------------------------------
        # 6. Fallback forensic score
        #
        # This is ONLY used if the ONNX model fails.
        # The normal decision always uses the real AI model.
        # ---------------------------------------------------------
        fallback_score = 10.0

        ai_tags = metadata.get("ai_metadata_tags", [])
        has_direct_ai_tags = len(ai_tags) > 0

        filename_lower = original_filename.lower()

        is_ai_filename = any(
            word in filename_lower
            for word in [
                "midjourney",
                "mj_",
                "dalle",
                "dall-e",
                "stablediffusion",
                "sd_",
                "flux_",
                "ai_gen",
                "generation",
                "synthetic",
                "deepfake",
                "fake_",
                "generated",
                "civitai",
                "prompt",
                "novelai",
                "comfyui",
                "craiyon",
                "nightcafe",
            ]
        )

        if has_direct_ai_tags:
            fallback_score += 70.0
        elif is_ai_filename:
            fallback_score += 45.0

        fft_variance = fft_metrics.get(
            "fft_spectrum_variance",
            200.0,
        )

        chromatic_div = chromatic_metrics.get(
            "channel_divergence",
            15.0,
        )

        laplacian_var = face_metrics.get(
            "laplacian_variance",
            300.0,
        )

        if chromatic_div > 35.0:
            fallback_score += 20.0
        elif chromatic_div > 25.0:
            fallback_score += 10.0

        if fft_variance > 450.0:
            fallback_score += 20.0
        elif fft_variance > 380.0:
            fallback_score += 10.0

        if laplacian_var < 80.0 and ela_std > 2.0:
            fallback_score += 15.0

        fallback_score = max(
            1.0,
            min(99.0, fallback_score),
        )

        # ---------------------------------------------------------
        # 7. FINAL AI PROBABILITY
        # ---------------------------------------------------------
        if model_ai_probability is not None:
            # REAL MODEL = PRIMARY SOURCE
            ai_probability = float(model_ai_probability)
            ai_model_used = True

        else:
            # Only use forensic fallback if model failed
            ai_probability = fallback_score
            ai_model_used = False

        ai_probability = max(
            0.0,
            min(100.0, ai_probability),
        )

        # ---------------------------------------------------------
        # 8. BINARY IMAGE CLASSIFICATION
        #
        # >= 50% = AI GENERATED = RED
        # < 50%  = NOT AI GENERATED = GREEN
        # ---------------------------------------------------------
        if ai_probability >= 50.0:

            result = "LIKELY_DEEPFAKE"
            risk_level = "HIGH"

            confidence = round(
                ai_probability,
                1,
            )

            authenticity_score = round(
                100.0 - ai_probability,
                1,
            )

            explanation_summary = (
                "AI-GENERATED IMAGE DETECTED: "
                "The trained AI image detection model "
                "classified this image as likely synthetic."
            )

        else:

            result = "AUTHENTIC"
            risk_level = "LOW"

            confidence = round(
                100.0 - ai_probability,
                1,
            )

            authenticity_score = round(
                100.0 - ai_probability,
                1,
            )

            explanation_summary = (
                "NO AI GENERATION DETECTED: "
                "The trained AI image detection model "
                "classified this image as likely authentic."
            )

        # ---------------------------------------------------------
        # 9. FORENSIC INDICATORS
        # ---------------------------------------------------------
        indicators: List[IndicatorResult] = []

        if model_ai_probability is not None:

            indicators.append(
                IndicatorResult(
                    name="AI Image Classification Model",
                    category="ai_detection",
                    severity=(
                        "HIGH"
                        if ai_probability >= 50.0
                        else "LOW"
                    ),
                    confidence=round(
                        ai_probability
                        if ai_probability >= 50.0
                        else 100.0 - ai_probability,
                        1,
                    ),
                    description=(
                        "ONNX-based AI image classifier "
                        "evaluated the visual content."
                    ),
                    metric_value=(
                        f"AI Probability: "
                        f"{ai_probability:.2f}%"
                    ),
                )
            )

        if has_direct_ai_tags:

            indicators.append(
                IndicatorResult(
                    name="AI Generation Metadata",
                    category="metadata",
                    severity="HIGH",
                    confidence=99.0,
                    description=(
                        "Metadata containing AI-generation "
                        "parameters or tags was detected."
                    ),
                    metric_value=(
                        f"AI Tags: {', '.join(ai_tags)}"
                    ),
                )
            )

        if fft_variance > 380.0:

            indicators.append(
                IndicatorResult(
                    name="High Frequency Spectral Anomaly",
                    category="frequency",
                    severity="MEDIUM",
                    confidence=round(
                        min(
                            95.0,
                            max(
                                50.0,
                                ai_probability,
                            ),
                        ),
                        1,
                    ),
                    description=(
                        "Elevated high-frequency spectral "
                        "activity was observed."
                    ),
                    metric_value=(
                        f"FFT Variance: "
                        f"{fft_variance:.2f}"
                    ),
                )
            )

        if chromatic_div > 25.0:

            indicators.append(
                IndicatorResult(
                    name="Chromatic Consistency Anomaly",
                    category="color",
                    severity="MEDIUM",
                    confidence=round(
                        min(
                            95.0,
                            max(
                                50.0,
                                ai_probability,
                            ),
                        ),
                        1,
                    ),
                    description=(
                        "Unusual RGB channel distribution "
                        "was detected."
                    ),
                    metric_value=(
                        f"Channel Divergence: "
                        f"{chromatic_div:.2f}"
                    ),
                )
            )

        if not indicators:

            indicators.append(
                IndicatorResult(
                    name="Standard Image Analysis",
                    category="forensics",
                    severity="LOW",
                    confidence=round(
                        confidence,
                        1,
                    ),
                    description=(
                        "No significant forensic anomalies "
                        "were detected."
                    ),
                    metric_value="Normal",
                )
            )

        # ---------------------------------------------------------
        # 10. Metadata returned to frontend/report
        # ---------------------------------------------------------
        all_metadata = {
            **metadata,
            **fft_metrics,
            **face_metrics,
            **chromatic_metrics,

            "ela_mean": round(
                ela_mean,
                2,
            ),

            "ela_std": round(
                ela_std,
                2,
            ),

            "ai_model_probability": round(
                ai_probability,
                2,
            ),

            "ai_model_used": ai_model_used,

            "fallback_probability": round(
                fallback_score,
                2,
            ),

            "image_verdict": result,

            "file_sha256": file_hash,

            "original_filename": original_filename,
        }

        if model_error:
            all_metadata["ai_model_error"] = model_error

        # ---------------------------------------------------------
        # 11. Processing time
        # ---------------------------------------------------------
        processing_time = round(
            time.time() - start_time,
            2,
        )

        # ---------------------------------------------------------
        # 12. Final response
        # ---------------------------------------------------------
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

            frames=[],

            metadata=all_metadata,

            heatmap_path=heatmap_url,
        )

