import io
from typing import Dict, Any, Tuple
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

class ImageFeatureExtractor:
    @staticmethod
    def extract_fft_spectrum(img_array: np.ndarray) -> Dict[str, float]:
        """
        Computes 2D Fast Fourier Transform to analyze frequency distribution.
        GAN/Diffusion generated images often display distinctive frequency anomalies
        such as high-frequency attenuation or unnatural periodic grid patterns.
        """
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array

        f = np.fft.fft2(gray)
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-7)
        
        h, w = gray.shape
        cy, cx = h // 2, w // 2
        
        # Low frequency center mask
        radius = min(h, w) // 8
        y, x = np.ogrid[:h, :w]
        center_mask = ((y - cy)**2 + (x - cx)**2) <= radius**2
        
        high_freq_mag = magnitude_spectrum[~center_mask].mean() if np.any(~center_mask) else 0.0
        low_freq_mag = magnitude_spectrum[center_mask].mean() if np.any(center_mask) else 1.0
        
        ratio = float(high_freq_mag / (low_freq_mag + 1e-5))
        spectrum_variance = float(np.var(magnitude_spectrum))
        
        return {
            "fft_high_freq_ratio": round(ratio, 4),
            "fft_spectrum_variance": round(spectrum_variance, 4),
            "fft_high_freq_mean": round(float(high_freq_mag), 2),
        }

    @staticmethod
    def compute_ela_metrics(img: Image.Image, quality: int = 90) -> Tuple[float, float, Image.Image]:
        """
        Error Level Analysis (ELA) resaves image at 90% quality and computes difference.
        In authentic images, all areas should degrade uniformly; spliced/manipulated
        regions degrade at substantially different error levels.
        """
        # Save temporary in-memory JPEG
        buffer = io.BytesIO()
        img.convert("RGB").save(buffer, format="JPEG", quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer)
        
        diff = ImageChops.difference(img.convert("RGB"), resaved)
        
        # Calculate difference metrics
        diff_array = np.array(diff).astype(np.float32)
        mean_diff = float(np.mean(diff_array))
        max_diff = float(np.max(diff_array))
        std_diff = float(np.std(diff_array))
        
        # Scale for visualization
        scale = 15.0
        enhanced_diff = ImageEnhance.Brightness(diff).enhance(scale)
        
        return mean_diff, std_diff, enhanced_diff

    @staticmethod
    def detect_face_and_boundary_features(img_array: np.ndarray) -> Dict[str, Any]:
        """
        Detects faces using OpenCV Haar cascades and analyzes boundary edge sharpness
        and facial symmetry metrics.
        """
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY) if len(img_array.shape) == 3 else img_array
        
        # Edge gradient sharpness via Laplacian
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        laplacian_var = float(laplacian.var())
        
        face_count = 0
        face_bboxes = []
        face_symmetry_scores = []
        
        try:
            cascade_path = getattr(cv2.data, 'haarcascades', '') + 'haarcascade_frontalface_default.xml'
            face_cascade = cv2.CascadeClassifier(cascade_path)
            if not face_cascade.empty():
                faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
                face_count = len(faces)
                for (x, y, w, h) in faces:
                    face_bboxes.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})
                    face_roi = gray[y:y+h, x:x+w]
                    if w > 10 and h > 10:
                        flipped = cv2.flip(face_roi, 1)
                        diff_sym = np.mean(np.abs(face_roi.astype(float) - flipped.astype(float)))
                        face_symmetry_scores.append(float(diff_sym))
        except Exception:
            pass
                
        avg_symmetry = float(np.mean(face_symmetry_scores)) if face_symmetry_scores else 0.0
        
        return {
            "faces_detected": face_count,
            "face_bboxes": face_bboxes,
            "laplacian_variance": round(laplacian_var, 2),
            "face_asymmetry_metric": round(avg_symmetry, 2),
        }

    @staticmethod
    def analyze_chromatic_consistency(img_array: np.ndarray) -> Dict[str, float]:
        """
        Analyzes color channel alignment and standard deviations across R, G, B channels.
        """
        if len(img_array.shape) < 3:
            return {"r_mean": 0.0, "g_mean": 0.0, "b_mean": 0.0, "color_discrepancy": 0.0}
            
        r, g, b = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2]
        r_mean, g_mean, b_mean = float(np.mean(r)), float(np.mean(g)), float(np.mean(b))
        r_std, g_std, b_std = float(np.std(r)), float(np.std(g)), float(np.std(b))
        
        channel_divergence = float(abs(r_std - g_std) + abs(g_std - b_std) + abs(r_std - b_std)) / 3.0
        
        return {
            "r_mean": round(r_mean, 2),
            "g_mean": round(g_mean, 2),
            "b_mean": round(b_mean, 2),
            "channel_divergence": round(channel_divergence, 2),
        }
