from pathlib import Path
from typing import List, Dict, Any, Tuple
import cv2
import numpy as np

class VideoPreprocessor:
    @staticmethod
    def extract_frames(video_path: Path, max_frames: int = 16) -> Tuple[List[np.ndarray], List[float], Dict[str, Any]]:
        """
        Extracts sample keyframes from video evenly across the duration using OpenCV.
        Returns extracted frames as RGB numpy arrays, timestamps, and video metadata.
        """
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            # Fallback for mock or empty video
            return [], [], {"error": "Could not open video stream", "duration": 0.0, "total_frames": 0, "fps": 0}
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
        duration = total_frames / fps if fps > 0 else 0.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        metadata: Dict[str, Any] = {
            "total_frames": total_frames,
            "fps": round(fps, 2),
            "duration_seconds": round(duration, 2),
            "resolution": f"{width}x{height}",
            "aspect_ratio": f"{round(width/height, 2)}:1" if height > 0 else "N/A",
            "fourcc": str(int(cap.get(cv2.CAP_PROP_FOURCC))),
        }
        
        frames: List[np.ndarray] = []
        timestamps: List[float] = []
        
        if total_frames > 0:
            step = max(1, total_frames // max_frames)
            for i in range(0, total_frames, step):
                if len(frames) >= max_frames:
                    break
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                if ret and frame is not None:
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frames.append(rgb_frame)
                    timestamps.append(round(i / fps, 2))
                    
        cap.release()
        return frames, timestamps, metadata
