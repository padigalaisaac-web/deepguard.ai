import os
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
from app.ai.preprocessing.image_preprocessor import ImagePreprocessor
from app.ai.features.image_features import ImageFeatureExtractor

# Create sample real camera-like image
real_img = Image.new("RGB", (600, 600), color=(140, 180, 220))
d = ImageDraw.Draw(real_img)
d.rectangle([100, 100, 500, 500], fill=(210, 160, 130), outline=(50, 50, 50))
arr = np.array(real_img)
noise = np.random.normal(0, 12, arr.shape).astype(np.int16)
arr_noisy = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
real_img = Image.fromarray(arr_noisy)
real_path = Path("uploads/sample_real.jpg")
real_img.save(real_path, quality=92)

# Create sample synthetic smooth AI-like image
ai_img = Image.new("RGB", (600, 600), color=(100, 100, 100))
d2 = ImageDraw.Draw(ai_img)
d2.ellipse([150, 150, 450, 450], fill=(220, 180, 160))
ai_path = Path("uploads/sample_ai.png")
ai_img.save(ai_path)

print("--- Real image metrics ---")
r_rgb, r_arr, r_meta = ImagePreprocessor.load_and_preprocess(real_path)
r_fft = ImageFeatureExtractor.extract_fft_spectrum(r_arr)
r_ela_mean, r_ela_std, _ = ImageFeatureExtractor.compute_ela_metrics(r_rgb)
r_face = ImageFeatureExtractor.detect_face_and_boundary_features(r_arr)
print("Real FFT:", r_fft)
print("Real ELA mean/std:", r_ela_mean, r_ela_std)
print("Real Lap var:", r_face["laplacian_variance"])

print("\n--- AI image metrics ---")
a_rgb, a_arr, a_meta = ImagePreprocessor.load_and_preprocess(ai_path)
a_fft = ImageFeatureExtractor.extract_fft_spectrum(a_arr)
a_ela_mean, a_ela_std, _ = ImageFeatureExtractor.compute_ela_metrics(a_rgb)
a_face = ImageFeatureExtractor.detect_face_and_boundary_features(a_arr)
print("AI FFT:", a_fft)
print("AI ELA mean/std:", a_ela_mean, a_ela_std)
print("AI Lap var:", a_face["laplacian_variance"])
