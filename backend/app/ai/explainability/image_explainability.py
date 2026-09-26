import os
import uuid
from pathlib import Path
from typing import Optional, Tuple
import cv2
import numpy as np
from PIL import Image
from app.core.config import settings

class ImageExplainability:
    @staticmethod
    def generate_anomaly_heatmap(img_array: np.ndarray, ela_diff_img: Image.Image, output_dir: Path) -> Tuple[str, str]:
        """
        Generates a visual AI Attention / Anomaly Heatmap overlay.
        Combines ELA residue with Gaussian boundary gradients to highlight
        suspicious high-frequency / compression manipulation zones.
        Saves heatmap to disk and returns filename and URL path.
        """
        os.makedirs(output_dir, exist_ok=True)
        heatmap_filename = f"heatmap_{uuid.uuid4().hex[:12]}.png"
        heatmap_filepath = output_dir / heatmap_filename
        
        # Prepare base image in BGR for OpenCV
        if len(img_array.shape) == 3:
            h, w, _ = img_array.shape
            bgr_orig = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        else:
            h, w = img_array.shape
            bgr_orig = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
            
        # Convert ELA diff to grayscale array
        ela_gray = np.array(ela_diff_img.convert("L")).astype(np.float32)
        if ela_gray.shape != (h, w):
            ela_gray = cv2.resize(ela_gray, (w, h))
            
        # Edge gradient detection for boundary anomalies
        gray = cv2.cvtColor(bgr_orig, cv2.COLOR_BGR2GRAY)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        laplacian_abs = np.abs(laplacian)
        laplacian_norm = (laplacian_abs / (np.max(laplacian_abs) + 1e-5)) * 255.0
        
        # Combine ELA and Edge gradient
        combined_anomaly = 0.6 * ela_gray + 0.4 * laplacian_norm
        # Apply Gaussian blur for smooth thermal heatmap appearance
        blurred = cv2.GaussianBlur(combined_anomaly, (31, 31), 0)
        norm_map = cv2.normalize(blurred, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        
        # Apply Jet / Turbo color map
        heatmap_colored = cv2.applyColorMap(norm_map, cv2.COLORMAP_JET)
        
        # Blend overlay with original image (alpha 0.55)
        overlay = cv2.addWeighted(bgr_orig, 0.45, heatmap_colored, 0.55, 0)
        
        cv2.imwrite(str(heatmap_filepath), overlay)
        
        return heatmap_filename, f"/api/analysis/heatmaps/{heatmap_filename}"
