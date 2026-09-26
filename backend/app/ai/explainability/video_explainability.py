from typing import List, Dict, Any
from app.ai.detectors.base_detector import FrameAnomaly

class VideoExplainability:
    @staticmethod
    def generate_timeline_anomalies(frame_deltas: List[Dict[str, Any]], base_confidence: float) -> List[FrameAnomaly]:
        """
        Converts temporal differences into timeline markers with formatted timestamps,
        anomaly labels, and severity indicators.
        """
        anomalies: List[FrameAnomaly] = []
        
        for idx, delta in enumerate(frame_deltas):
            ts = delta["timestamp"]
            mins = int(ts // 60)
            secs = int(ts % 60)
            ts_str = f"{mins:02d}:{secs:02d}"
            
            # Anomaly scoring based on temporal delta
            mse = delta["mse"]
            if mse > 80.0:
                severity = "HIGH"
                score = min(98.5, base_confidence + 12.0)
                label = "Abrupt facial boundary jitter / warping detected"
            elif mse > 40.0:
                severity = "MEDIUM"
                score = min(85.0, base_confidence + 4.0)
                label = "Moderate frame-to-frame pixel interpolation anomaly"
            else:
                severity = "LOW"
                score = max(15.0, base_confidence - 25.0)
                label = "Consistent temporal optical flow"
                
            anomalies.append(FrameAnomaly(
                timestamp=ts,
                timestamp_str=ts_str,
                frame_number=delta["frame_index"],
                score=round(score, 1),
                anomaly_label=label,
                severity=severity
            ))
            
        return anomalies
