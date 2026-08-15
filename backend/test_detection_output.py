from pathlib import Path
from app.ai.detectors.image_detector import ImageDeepfakeDetector

detector = ImageDeepfakeDetector()

print("--- Testing Real Sample Image ---")
res_real = detector.detect(Path("uploads/sample_real.jpg"), "sample_real.jpg")
print(f"Verdict: {res_real.result}")
print(f"Confidence: {res_real.confidence}%")
print(f"Authenticity Score: {res_real.authenticity_score}%")
print(f"Risk Level: {res_real.risk_level}")
print(f"Indicators: {[i.name for i in res_real.indicators]}")

print("\n--- Testing AI Sample Image ---")
res_ai = detector.detect(Path("uploads/sample_ai.png"), "sample_ai.png")
print(f"Verdict: {res_ai.result}")
print(f"Confidence: {res_ai.confidence}%")
print(f"Authenticity Score: {res_ai.authenticity_score}%")
print(f"Risk Level: {res_ai.risk_level}")
print(f"Indicators: {[i.name for i in res_ai.indicators]}")
