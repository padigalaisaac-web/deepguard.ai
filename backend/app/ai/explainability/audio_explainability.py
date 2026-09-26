from typing import List, Dict, Any
from app.ai.detectors.base_detector import FrameAnomaly

class AudioExplainability:
    @staticmethod
    def generate_audio_segments(segment_scores: List[Dict[str, Any]], base_confidence: float) -> List[FrameAnomaly]:
        """
        Creates timestamped suspicious segment markers for audio analysis.
        """
        anomalies: List[FrameAnomaly] = []
        
        for idx, seg in enumerate(segment_scores):
            start = seg["start_seconds"]
            end = seg["end_seconds"]
            mins_s = int(start // 60)
            secs_s = int(start % 60)
            mins_e = int(end // 60)
            secs_e = int(end % 60)
            ts_str = f"{mins_s:02d}:{secs_s:02d}–{mins_e:02d}:{secs_e:02d}"
            
            # Anomaly scoring based on flatness and energy variance
            flatness = seg.get("flatness", 0.0)
            if flatness > 0.4:
                severity = "HIGH"
                score = min(96.0, base_confidence + 10.0)
                label = "Synthetic vocoder / robotic phase discontinuity"
            elif flatness > 0.2:
                severity = "MEDIUM"
                score = min(82.0, base_confidence + 2.0)
                label = "Unnatural spectral envelope flatness"
            else:
                severity = "LOW"
                score = max(20.0, base_confidence - 20.0)
                label = "Natural acoustic harmonics"
                
            anomalies.append(FrameAnomaly(
                timestamp=start,
                timestamp_str=ts_str,
                frame_number=idx,
                score=round(score, 1),
                anomaly_label=label,
                severity=severity
            ))
            
        return anomalies
