from pathlib import Path
from app.ai.detectors.base_detector import BaseDetector, DetectionOutput
from app.ai.detectors.image_detector import ImageDeepfakeDetector
from app.ai.detectors.video_detector import VideoDeepfakeDetector
from app.ai.detectors.audio_detector import AudioDeepfakeDetector

class DemoDetectorFactory:
    @staticmethod
    def get_detector(media_type: str) -> BaseDetector:
        """
        Factory method returning appropriate detector implementation
        for the media type.
        """
        media_type = media_type.lower()
        if media_type == "image":
            return ImageDeepfakeDetector()
        elif media_type == "video":
            return VideoDeepfakeDetector()
        elif media_type == "audio":
            return AudioDeepfakeDetector()
        else:
            raise ValueError(f"Unsupported media type: {media_type}")
