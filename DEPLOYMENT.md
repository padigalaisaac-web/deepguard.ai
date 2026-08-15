# DeepFake (DeepGuard AI) — Complete Deployment Guide

This guide details three production deployment options for **DeepGuard AI**:

1. **Option A (Recommended & Free)**: Deploy Frontend on **Vercel** + Backend on **Render / Railway**
2. **Option B (All-in-One Docker)**: Deploy anywhere with **Docker Compose** (DigitalOcean / AWS / VPS)
3. **Option C (Linux Server)**: Deploy natively on **Ubuntu / Debian** with Systemd + Nginx

---

## 🚀 Option A: Free Cloud Deployment (Vercel + Render)

### Step 1: Push Code to GitHub

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: DeepGuard AI Full-Stack App"

# Create a new GitHub repository at https://github.com/new and push
git remote add origin https://github.com/YOUR_USERNAME/deepguard-ai.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Backend on Render (Free)

1. Go to [https://render.com](https://render.com) and log in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your GitHub repository (`deepguard-ai`).
4. Configure the settings:
   - **Name**: `deepguard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `SECRET_KEY`: *Any random 32-character string (e.g. `your-super-secret-key-deepguard-2026`)*
   - `DEMO_MODE`: `true`
   - `CORS_ORIGINS`: `["*"]`
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://deepguard-backend.onrender.com`).

---

### Step 3: Deploy Frontend on Vercel (Free)

1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your `deepguard-ai` repository.
4. Configure the build settings:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Paste your Render backend URL (e.g., `https://deepguard-backend.onrender.com`)
6. Click **Deploy**.
7. Your app is now live at `https://deepguard-ai.vercel.app`! 🎉

---

## 🐳 Option B: Docker Compose (VPS / AWS EC2 / DigitalOcean)

Deploy the entire stack (Frontend, Backend, PostgreSQL database) with a single command on any VPS or cloud instance:

### 1. Connect to your VPS server:
```bash
ssh root@your-server-ip
```

### 2. Install Docker & Docker Compose:
```bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 3. Clone and Start Application:
```bash
git clone https://github.com/YOUR_USERNAME/deepguard-ai.git
cd deepguard-ai

# Start all services in background
docker compose up -d --build
```

- **Frontend UI**: `http://your-server-ip:3000`
- **Backend API**: `http://your-server-ip:8000`
- **Interactive Swagger Docs**: `http://your-server-ip:8000/docs`

---

## 🖥️ Option C: Ubuntu Linux Server (Native Systemd + Nginx)

### 1. Backend Service Setup

```bash
cd /var/www/deepguard-ai/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Seed initial forensic records
python3 -m app.database.seed_data
```

Create Systemd Service (`/etc/systemd/system/deepguard-backend.service`):
```ini
[Unit]
Description=DeepGuard AI Backend Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/deepguard-ai/backend
ExecStart=/var/www/deepguard-ai/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable deepguard-backend
sudo systemctl start deepguard-backend
```

---

### 2. Frontend Build & Nginx Setup

```bash
cd /var/www/deepguard-ai/frontend
npm install
npm run build
```

Configure Nginx (`/etc/nginx/sites-available/deepguard`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/deepguard-ai/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/deepguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔐 Default Access Credentials

Once deployed, you can immediately log in with the pre-seeded accounts:

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@deepguard.ai` | `Admin@123456` |
| **Forensic Analyst** | `user@deepguard.ai` | `User@123456` |
