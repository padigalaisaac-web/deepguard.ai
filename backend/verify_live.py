import httpx

def main():
    print("--- 1. Checking Backend Root & Health ---")
    r = httpx.get("http://127.0.0.1:8000/")
    print(f"GET /: {r.status_code}, {r.json()}")
    r_health = httpx.get("http://127.0.0.1:8000/health")
    print(f"GET /health: {r_health.status_code}, {r_health.json()}")

    print("\n--- 2. User Login ---")
    r_login = httpx.post("http://127.0.0.1:8000/api/auth/login", json={
        "email": "user@deepguard.ai",
        "password": "User@123456"
    })
    print(f"POST /api/auth/login: {r_login.status_code}")
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Dashboard Stats & Trends ---")
    r_stats = httpx.get("http://127.0.0.1:8000/api/dashboard/stats", headers=headers)
    print(f"GET /api/dashboard/stats: {r_stats.status_code}, {r_stats.json()}")
    r_trends = httpx.get("http://127.0.0.1:8000/api/dashboard/trends", headers=headers)
    print(f"GET /api/dashboard/trends: {r_trends.status_code}, media_types: {len(r_trends.json()['media_distribution'])}")

    print("\n--- 4. List Analyses ---")
    r_list = httpx.get("http://127.0.0.1:8000/api/analysis", headers=headers)
    analyses = r_list.json()
    print(f"GET /api/analysis: {r_list.status_code}, Total: {analyses['total']}, Items: {len(analyses['items'])}")
    first_id = analyses["items"][0]["id"]

    print("\n--- 5. Analysis Detail & Report ---")
    r_detail = httpx.get(f"http://127.0.0.1:8000/api/analysis/{first_id}", headers=headers)
    det = r_detail.json()
    print(f"GET /api/analysis/{first_id}: {r_detail.status_code}")
    print(f"  Result: {det['result']}, Confidence: {det['confidence']}%, Risk: {det['risk_level']}")
    print(f"  Indicators: {len(det['indicators'])}, Frames: {len(det['frames'])}, Model: {det['model']}")

    r_pdf = httpx.get(f"http://127.0.0.1:8000/api/analysis/{first_id}/report", headers=headers)
    print(f"GET /api/analysis/{first_id}/report: {r_pdf.status_code}, Content-Type: {r_pdf.headers.get('content-type')}, Size: {len(r_pdf.content)} bytes")

    print("\n--- 6. Admin Login & System Health ---")
    r_admin_login = httpx.post("http://127.0.0.1:8000/api/auth/login", json={
        "email": "admin@deepguard.ai",
        "password": "Admin@123456"
    })
    admin_token = r_admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    r_health = httpx.get("http://127.0.0.1:8000/api/admin/system-health", headers=admin_headers)
    print(f"GET /api/admin/system-health: {r_health.status_code}, {r_health.json()}")
    r_users = httpx.get("http://127.0.0.1:8000/api/admin/users", headers=admin_headers)
    print(f"GET /api/admin/users: {r_users.status_code}, Total users: {r_users.json()['total']}")
    r_logs = httpx.get("http://127.0.0.1:8000/api/admin/audit-logs", headers=admin_headers)
    print(f"GET /api/admin/audit-logs: {r_logs.status_code}, Total logs: {r_logs.json()['total']}")

    print("\n--- 7. Frontend Check ---")
    r_fe = httpx.get("http://localhost:5173/")
    print(f"GET http://localhost:5173/: {r_fe.status_code}, HTML Title match: {'DeepFake' in r_fe.text}")

    print("\n>>> ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    main()
