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
            model_version="v4.0.0-onnx-only",
            mode="onnx-ai-model",
        )

    def detect(
        self,
        file_path: Path,
        original_filename: str,
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
        # These are used for information and indicators only.
        # They are NOT used to decide Real/Fake.
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
        # 3. Generate heatmap
        # ---------------------------------------------------------
        heatmap_filename, heatmap_url = (
            ImageExplainability.generate_anomaly_heatmap(
                img_array,
                ela_diff_img,
                settings.HEATMAPS_DIR,
            )
        )

        # ---------------------------------------------------------
        # 4. File hash
        # ---------------------------------------------------------
        with open(file_path, "rb") as file:
            file_hash = hashlib.sha256(
                file.read()
            ).hexdigest()

        # ---------------------------------------------------------
        # 5. REAL ONNX MODEL PREDICTION
        # Do not silently use a heuristic fallback.
        # ---------------------------------------------------------
        model_error = None

        try:
            model_ai_probability = predict_ai_probability(img_rgb)

        except Exception as exc:
            model_error = str(exc)

            print(
                "AI MODEL PREDICTION FAILED:",
                repr(exc),
            )

            raise RuntimeError(
                "The AI detection model failed. "
                "The image was not classified."
            ) from exc

        if model_ai_probability is None:
            raise RuntimeError(
                "The AI detection model returned no prediction."
            )

        ai_probability = float(model_ai_probability)

        if ai_probability < 0.0 or ai_probability > 100.0:
            raise RuntimeError(
                "The AI model returned an invalid probability: "
                f"{ai_probability}"
            )

        ai_model_used = True

        # ---------------------------------------------------------
        # 6. Final classification
        #
        # IMPORTANT:
        # predict_ai_probability() must return:
        # 0   = definitely real
        # 100 = definitely AI-generated/fake
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
                "The ONNX AI image detection model "
                "classified this image as likely "
                "AI-generated or manipulated."
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
                "The ONNX AI image detection model "
                "classified this image as likely authentic."
            )

        # ---------------------------------------------------------
        # 7. Indicators
        # ---------------------------------------------------------
        indicators: List[IndicatorResult] = []

        indicators.append(
            IndicatorResult(
                name="ONNX AI Image Classification",
                category="ai_detection",
                severity=(
                    "HIGH"
                    if ai_probability >= 50.0
                    else "LOW"
                ),
                confidence=round(
                    max(
                        ai_probability,
                        100.0 - ai_probability,
                    ),
                    1,
                ),
                description=(
                    "The trained ONNX image classification "
                    "model evaluated the image."
                ),
                metric_value=(
                    f"AI Probability: "
                    f"{ai_probability:.2f}%"
                ),
            )
        )

        # ---------------------------------------------------------
        # 8. Metadata indicators
        # These do not change the final prediction.
        # ---------------------------------------------------------
        ai_tags = metadata.get(
            "ai_metadata_tags",
            [],
        )

        if ai_tags:
            indicators.append(
                IndicatorResult(
                    name="AI Generation Metadata",
                    category="metadata",
                    severity="MEDIUM",
                    confidence=90.0,
                    description=(
                        "Metadata containing possible "
                        "AI-generation information was detected."
                    ),
                    metric_value=(
                        f"AI Tags: {', '.join(ai_tags)}"
                    ),
                )
            )

        # ---------------------------------------------------------
        # 9. Forensic indicators
        # These are informational only.
        # ---------------------------------------------------------
        fft_variance = fft_metrics.get(
            "fft_spectrum_variance",
            0.0,
        )

        chromatic_div = chromatic_metrics.get(
            "channel_divergence",
            0.0,
        )

        if fft_variance > 380.0:
            indicators.append(
                IndicatorResult(
                    name="High Frequency Spectral Activity",
                    category="frequency",
                    severity="MEDIUM",
                    confidence=50.0,
                    description=(
                        "High-frequency image activity was observed. "
                        "This is not proof of AI generation."
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
                    name="Chromatic Distribution Activity",
                    category="color",
                    severity="MEDIUM",
                    confidence=50.0,
                    description=(
                        "An unusual RGB channel distribution "
                        "was observed. This is not proof "
                        "of AI generation."
                    ),
                    metric_value=(
                        f"Channel Divergence: "
                        f"{chromatic_div:.2f}"
                    ),
                )
            )

        # ---------------------------------------------------------
        # 10. Metadata returned to frontend
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

            "image_verdict": result,

            "file_sha256": file_hash,

            "original_filename": original_filename,

            "detector_note": (
                "Final classification uses the ONNX model only. "
                "Forensic features are informational."
            ),
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
