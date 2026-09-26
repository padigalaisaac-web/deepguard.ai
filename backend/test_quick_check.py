from pathlib import Path
from app.ai.detectors.image_detector import ImageDeepfakeDetector

detector = ImageDeepfakeDetector()

print("--- 1. Real Camera Image Test ---")
res_real = detector.detect(Path("uploads/test_real_camera.jpg"), "my_real_photo.jpg")
print(f"Result: {res_real.result}")
print(f"Confidence (Authenticity): {res_real.confidence}%")
print(f"Authenticity Score: {res_real.authenticity_score}%")
print(f"Risk Level: {res_real.risk_level}")
print(f"Indicators: {[i.name for i in res_real.indicators]}")

print("\n--- 2. AI Midjourney Image Test ---")
res_ai = detector.detect(Path("uploads/test_ai_midjourney.png"), "midjourney_fantasy_art.png")
print(f"Result: {res_ai.result}")
print(f"Confidence (Deepfake): {res_ai.confidence}%")
print(f"Authenticity Score: {res_ai.authenticity_score}%")
print(f"Risk Level: {res_ai.risk_level}")
print(f"Indicators: {[i.name for i in res_ai.indicators]}")
