def test_register_and_login(client):
    # 1. Register new user
    res = client.post("/api/auth/register", json={
        "name": "Sarah Connor",
        "email": "sarah@deepguard.ai",
        "password": "Password@123"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "sarah@deepguard.ai"
    token = data["access_token"]
    
    # 2. Get /me
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["name"] == "Sarah Connor"
    
    # 3. Login
    res_login = client.post("/api/auth/login", json={
        "email": "sarah@deepguard.ai",
        "password": "Password@123"
    })
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

def test_admin_access(client):
    # Admin login
    res = client.post("/api/auth/login", json={
        "email": "admin@deepguard.ai",
        "password": "Admin@123456"
    })
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    
    # Access admin users
    res_users = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_users.status_code == 200
    assert "items" in res_users.json()
