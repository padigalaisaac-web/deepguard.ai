import io
from PIL import Image

def test_upload_and_analyze_image(client):
    # 1. Login user
    res_login = client.post("/api/auth/login", json={
        "email": "user@deepguard.ai",
        "password": "User@123456"
    })
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create in-memory test image
    img_byte_arr = io.BytesIO()
    image = Image.new("RGB", (200, 200), color=(73, 109, 137))
    image.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()
    
    # 3. Upload image
    upload_res = client.post(
        "/api/analysis/upload",
        files={"file": ("test_photo.jpg", img_bytes, "image/jpeg")},
        headers=headers
    )
    assert upload_res.status_code == 201
    analysis_data = upload_res.json()
    analysis_id = analysis_data["analysis_id"]
    assert analysis_data["media_type"] == "image"
    
    # 4. Run Analysis
    run_res = client.post(f"/api/analysis/{analysis_id}/run", headers=headers)
    assert run_res.status_code == 200
    result = run_res.json()
    assert result["status"] == "COMPLETED"
    assert result["result"] in ["AUTHENTIC", "LIKELY_DEEPFAKE", "SUSPICIOUS"]
    assert result["confidence"] > 0
    assert len(result["indicators"]) > 0
    assert result["model"]["mode"] == "prototype"
    
    # 5. List Analyses
    list_res = client.get("/api/analysis", headers=headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1
    
    # 6. Download PDF Report
    report_res = client.get(f"/api/analysis/{analysis_id}/report", headers=headers)
    assert report_res.status_code == 200
    assert report_res.headers["content-type"] == "application/pdf"
