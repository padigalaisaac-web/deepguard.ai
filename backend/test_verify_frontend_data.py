import httpx

def check_both():
    r_login = httpx.post("http://127.0.0.1:8000/api/auth/login", json={
        "email": "user@deepguard.ai",
        "password": "User@123456"
    })
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("--- 1. Real Image Analysis (http://localhost:5173/analysis/bc2ede20-f4e0-454f-8f69-6adea564a0c4) ---")
    r_real = httpx.get("http://127.0.0.1:8000/api/analysis/bc2ede20-f4e0-454f-8f69-6adea564a0c4", headers=headers)
    real_data = r_real.json()
    print(f"Verdict: {real_data['result']}")
    print(f"Confidence (Authenticity): {real_data['confidence']}%")
    print(f"Authenticity Score: {real_data['authenticity_score']}%")
    print(f"Risk Level: {real_data['risk_level']}")
    print(f"Explanation: {real_data['explanation_summary']}")

    print("\n--- 2. AI Image Analysis (http://localhost:5173/analysis/c5bf2b47-b191-4e94-ad4f-646903986cbc) ---")
    r_ai = httpx.get("http://127.0.0.1:8000/api/analysis/c5bf2b47-b191-4e94-ad4f-646903986cbc", headers=headers)
    ai_data = r_ai.json()
    print(f"Verdict: {ai_data['result']}")
    print(f"Confidence (Deepfake): {ai_data['confidence']}%")
    print(f"Authenticity Score: {ai_data['authenticity_score']}%")
    print(f"Risk Level: {ai_data['risk_level']}")
    print(f"Explanation: {ai_data['explanation_summary']}")

if __name__ == "__main__":
    check_both()
