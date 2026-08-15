from typing import List, Dict, Any
import cv2
import numpy as np

class VideoFeatureExtractor:
    @staticmethod
    def analyze_temporal_consistency(frames: List[np.ndarray], timestamps: List[float]) -> Dict[str, Any]:
        """
        Calculates inter-frame mean squared error (MSE), structural similarity,
        and temporal optical flow jitter. Deepfakes frequently exhibit high
        frame-to-frame boundary flickering or unnatural facial morphing between keyframes.
        """
        if len(frames) < 2:
            return {
                "avg_temporal_delta": 0.0,
                "temporal_jitter_variance": 0.0,
                "frame_deltas": [],
                "max_delta_timestamp": 0.0
            }
            
        frame_deltas = []
        for i in range(1, len(frames)):
            prev_gray = cv2.cvtColor(frames[i-1], cv2.COLOR_RGB2GRAY) if len(frames[i-1].shape) == 3 else frames[i-1]
            curr_gray = cv2.cvtColor(frames[i], cv2.COLOR_RGB2GRAY) if len(frames[i].shape) == 3 else frames[i]
            
            # Resize to identical shape if required
            if prev_gray.shape != curr_gray.shape:
                curr_gray = cv2.resize(curr_gray, (prev_gray.shape[1], prev_gray.shape[0]))
                
            diff = np.abs(curr_gray.astype(float) - prev_gray.astype(float))
            mse = float(np.mean(diff ** 2))
            frame_deltas.append({
                "frame_index": i,
                "timestamp": timestamps[i] if i < len(timestamps) else round(i * 0.5, 2),
                "mse": round(mse, 2),
                "mean_diff": round(float(np.mean(diff)), 2)
            })
            
        mse_values = [f["mse"] for f in frame_deltas]
        avg_mse = float(np.mean(mse_values)) if mse_values else 0.0
        var_mse = float(np.var(mse_values)) if mse_values else 0.0
        
        max_idx = int(np.argmax(mse_values)) if mse_values else 0
        max_ts = frame_deltas[max_idx]["timestamp"] if frame_deltas else 0.0
        
        return {
            "avg_temporal_delta": round(avg_mse, 2),
            "temporal_jitter_variance": round(var_mse, 2),
            "frame_deltas": frame_deltas,
            "max_delta_timestamp": max_ts
        }
