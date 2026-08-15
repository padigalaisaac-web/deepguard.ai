from typing import Dict, Any, List
import numpy as np

class AudioFeatureExtractor:
    @staticmethod
    def extract_spectral_features(audio_signal: np.ndarray, sample_rate: int = 44100) -> Dict[str, Any]:
        """
        Extracts spectral centroid, zero-crossing rate (ZCR), energy distribution,
        and synthetic spectral band discontinuities.
        """
        if len(audio_signal) == 0:
            return {
                "zero_crossing_rate": 0.0,
                "spectral_centroid": 0.0,
                "spectral_flatness": 0.0,
                "subband_energy_variance": 0.0,
                "segment_scores": []
            }
            
        # Zero Crossing Rate (ZCR)
        zero_crossings = np.nonzero(np.diff(audio_signal > 0))[0]
        zcr = float(len(zero_crossings) / len(audio_signal)) if len(audio_signal) > 0 else 0.0
        
        # Segment analysis (e.g. 10 temporal slices)
        num_segments = 10
        seg_len = max(1, len(audio_signal) // num_segments)
        segment_scores = []
        
        subband_energies = []
        for s in range(num_segments):
            chunk = audio_signal[s * seg_len : (s + 1) * seg_len]
            if len(chunk) == 0:
                continue
            energy = float(np.sum(chunk ** 2) / len(chunk))
            subband_energies.append(energy)
            
            # Simple FFT on chunk
            fft_mag = np.abs(np.fft.rfft(chunk))
            freqs = np.fft.rfftfreq(len(chunk), 1.0 / sample_rate)
            centroid = float(np.sum(freqs * fft_mag) / (np.sum(fft_mag) + 1e-7))
            
            # Spectral flatness
            geom_mean = np.exp(np.mean(np.log(fft_mag + 1e-7)))
            arith_mean = np.mean(fft_mag) + 1e-7
            flatness = float(geom_mean / arith_mean)
            
            segment_scores.append({
                "segment_index": s,
                "start_seconds": round(s * (len(audio_signal) / sample_rate / num_segments), 2),
                "end_seconds": round((s + 1) * (len(audio_signal) / sample_rate / num_segments), 2),
                "energy": round(energy, 4),
                "spectral_centroid": round(centroid, 1),
                "flatness": round(flatness, 4)
            })
            
        return {
            "zero_crossing_rate": round(zcr, 4),
            "spectral_centroid": round(float(np.mean([s['spectral_centroid'] for s in segment_scores])) if segment_scores else 0.0, 1),
            "spectral_flatness": round(float(np.mean([s['flatness'] for s in segment_scores])) if segment_scores else 0.0, 4),
            "subband_energy_variance": round(float(np.var(subband_energies)) if subband_energies else 0.0, 6),
            "segment_scores": segment_scores
        }
