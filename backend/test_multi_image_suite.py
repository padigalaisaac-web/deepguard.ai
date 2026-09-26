from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
from app.ai.detectors.image_detector import ImageDeepfakeDetector

def run_suite():
    detector = ImageDeepfakeDetector()
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)

    # 1. Real Smartphone Photo (Natural noise, balanced colors, JPG)
    img_phone = Image.new("RGB", (1024, 768), color=(140, 170, 200))
    d = ImageDraw.Draw(img_phone)
    d.rectangle([100, 100, 924, 668], fill=(200, 150, 120))
    d.text((150, 150), "Smartphone Photo Scene", fill=(30, 30, 30))
    arr_phone = np.array(img_phone)
    noise = np.random.normal(0, 8, arr_phone.shape).astype(np.int16)
    arr_phone = np.clip(arr_phone.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    p_phone = uploads_dir / "IMG_20260815_142010.jpg"
    Image.fromarray(arr_phone).save(p_phone, quality=90)

    # 2. Real Nature Landscape (Green/Earth tones, organic textures)
    img_nature = Image.new("RGB", (800, 600), color=(80, 140, 70))
    d2 = ImageDraw.Draw(img_nature)
    d2.polygon([(100, 500), (400, 100), (700, 500)], fill=(110, 80, 50))
    arr_nature = np.array(img_nature)
    noise2 = np.random.normal(0, 12, arr_nature.shape).astype(np.int16)
    arr_nature = np.clip(arr_nature.astype(np.int16) + noise2, 0, 255).astype(np.uint8)
    p_nature = uploads_dir / "nature_landscape_photo.jpeg"
    Image.fromarray(arr_nature).save(p_nature, quality=85)

    # 3. AI Midjourney V6 Art (Hyper-saturated, synthetic color divergence)
    img_mj = Image.new("RGB", (1024, 1024), color=(20, 10, 40))
    d3 = ImageDraw.Draw(img_mj)
    d3.ellipse([100, 100, 924, 924], fill=(255, 60, 220))
    d3.rectangle([300, 300, 724, 724], fill=(0, 255, 230))
    p_mj = uploads_dir / "midjourney_cyberpunk_artwork.png"
    img_mj.save(p_mj)

    # 4. AI DALL-E 3 Style Portrait (Diffusion smooth textures, synthetic frequency spikes)
    img_dalle = Image.new("RGB", (800, 800), color=(10, 25, 45))
    d4 = ImageDraw.Draw(img_dalle)
    d4.ellipse([200, 200, 600, 600], fill=(255, 180, 130))
    d4.ellipse([250, 250, 550, 550], fill=(255, 220, 200))
    p_dalle = uploads_dir / "dalle3_generated_portrait.png"
    img_dalle.save(p_dalle)

    test_cases = [
        ("Real Phone Photo (IMG_...)", p_phone, p_phone.name),
        ("Real Landscape Photo (nature...)", p_nature, p_nature.name),
        ("AI Midjourney Art (midjourney...)", p_mj, p_mj.name),
        ("AI DALL-E 3 Portrait (dalle3...)", p_dalle, p_dalle.name),
    ]

    print("================================================================================")
    print("                 DEEPGUARD AI MULTI-IMAGE FORENSIC TEST SUITE                   ")
    print("================================================================================")
    for label, path, filename in test_cases:
        res = detector.detect(path, filename)
        ui_badge = "GREEN (AI: NO / AUTHENTIC)" if res.result == "AUTHENTIC" else "RED (AI: YES / DEEPFAKE)" if res.result == "LIKELY_DEEPFAKE" else "AMBER (SUSPICIOUS)"
        print(f"\n[Case]: {label}")
        print(f"  Filename:     {filename}")
        print(f"  Verdict:      {res.result}")
        print(f"  Confidence:   {res.confidence}%")
        print(f"  Authenticity: {res.authenticity_score}%")
        print(f"  Risk Level:   {res.risk_level}")
        print(f"  UI Display:   {ui_badge}")
        print(f"  Top Indicator:{res.indicators[0].name if res.indicators else 'None'}")
    print("\n================================================================================")

if __name__ == "__main__":
    run_suite()
