import io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

from app.ai.preprocessing.image_preprocessor import ImagePreprocessor
from app.ai.features.image_features import ImageFeatureExtractor

def test_samples():
    print("Testing realistic feature extraction...")

    # Real Photo Simulation (e.g. natural outdoor/indoor photo with standard camera sensor properties)
    real_img = Image.new("RGB", (800, 600), color=(120, 150, 180))
    d = ImageDraw.Draw(real_img)
    d.rectangle([50, 50, 750, 550], fill=(180, 140, 110))
    d.text((100, 100), "Real Camera Scene", fill=(40, 40, 40))
    # Add natural lens noise
    arr = np.array(real_img)
    noise = np.random.normal(0, 10, arr.shape).astype(np.int16)
    arr_real = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    real_p = Path("uploads/test_real_camera.jpg")
    Image.fromarray(arr_real).save(real_p, quality=88)

    # AI Image Simulation (e.g. Midjourney / Stable Diffusion style image with hyper-saturation & synthetic prompt)
    ai_img = Image.new("RGB", (800, 600), color=(30, 20, 50))
    d2 = ImageDraw.Draw(ai_img)
    d2.ellipse([200, 100, 600, 500], fill=(255, 100, 180)) # Hyper-saturated synthetic colors
    d2.text((250, 250), "Generative AI Art", fill=(0, 255, 200))
    ai_p = Path("uploads/test_ai_midjourney.png")
    # Save with synthetic metadata info
    ai_img.save(ai_p, pnginfo=None)

    for p in [real_p, ai_p]:
        _, arr_loaded, meta = ImagePreprocessor.load_and_preprocess(p)
        fft = ImageFeatureExtractor.extract_fft_spectrum(arr_loaded)
        ela_m, ela_s, _ = ImageFeatureExtractor.compute_ela_metrics(Image.fromarray(arr_loaded))
        chroma = ImageFeatureExtractor.analyze_chromatic_consistency(arr_loaded)
        face = ImageFeatureExtractor.detect_face_and_boundary_features(arr_loaded)
        print(f"\n--- Metrics for {p.name} ---")
        print(f"  Format: {meta['format']}, EXIF: {meta['has_exif']}")
        print(f"  FFT Variance: {fft['fft_spectrum_variance']}, FFT Ratio: {fft['fft_high_freq_ratio']}")
        print(f"  ELA Mean: {ela_m:.2f}, ELA Std: {ela_s:.2f}")
        print(f"  Chromatic Divergence: {chroma['channel_divergence']:.2f}")
        print(f"  Laplacian Var: {face['laplacian_variance']}")

if __name__ == "__main__":
    test_samples()
