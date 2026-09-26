import httpx

def test_api_upload_and_analyze():
    # 1. Login
    r_login = httpx.post("http://127.0.0.1:8000/api/auth/login", json={
        "email": "user@deepguard.ai",
        "password": "User@123456"
    })
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Real Normal Camera Image
    with open("uploads/test_real_camera.jpg", "rb") as f:
        r_up_real = httpx.post("http://127.0.0.1:8000/api/analysis/upload", headers=headers, files={
            "file": ("my_vacation_photo.jpg", f.read(), "image/jpeg")
        })
    real_id = r_up_real.json()["analysis_id"]
    r_run_real = httpx.post(f"http://127.0.0.1:8000/api/analysis/{real_id}/run", headers=headers)
    real_det = r_run_real.json()
    print("=== 1. REAL NORMAL CAMERA IMAGE TEST ===")
    print(f"Result: {real_det['result']}")
    print(f"Confidence (Authenticity): {real_det['confidence']}%")
    print(f"Authenticity Score: {real_det['authenticity_score']}%")
    print(f"Risk Level: {real_det['risk_level']}")
    print(f"Explanation: {real_det['explanation_summary']}")

    # 3. Upload AI Midjourney Generated Image
    with open("uploads/test_ai_midjourney.png", "rb") as f:
        r_up_ai = httpx.post("http://127.0.0.1:8000/api/analysis/upload", headers=headers, files={
            "file": ("midjourney_cyberpunk_character.png", f.read(), "image/png")
        })
    ai_id = r_up_ai.json()["analysis_id"]
    r_run_ai = httpx.post(f"http://127.0.0.1:8000/api/analysis/{ai_id}/run", headers=headers)
    ai_det = r_run_ai.json()
    print("\n=== 2. AI GENERATED IMAGE TEST ===")
    print(f"Result: {ai_det['result']}")
    print(f"Confidence (Deepfake): {ai_det['confidence']}%")
    print(f"Authenticity Score: {ai_det['authenticity_score']}%")
    print(f"Risk Level: {ai_det['risk_level']}")
    print(f"Explanation: {ai_det['explanation_summary']}")

if __name__ == "__main__":
    test_api_upload_and_analyze()
