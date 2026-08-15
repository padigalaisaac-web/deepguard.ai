# DeepFake — DeepGuard AI Deepfake Detection System

> **"Detect. Verify. Trust."**  
> *AI-powered deepfake detection for images, videos, and audio.*

---

## 1. Project Overview

**DeepGuard AI** is a production-ready, enterprise-grade digital forensic web application engineered to analyze digital media (**images, videos, and audio**) and determine whether payloads are **Authentic**, **Manipulated / Deepfake**, or **Suspicious / Uncertain**.

The system features:
- Multi-modal forensic feature extraction (2D FFT, Error Level Analysis, temporal optical flow jitter, spectral flatness).
- Explainable AI heatmaps, video frame anomaly timelines, and audio spectrogram segments.
- Certified formal forensic PDF report export with cryptographic SHA-256 evidence integrity locks.
- Role-based authentication (USER, ADMIN) with audit trails, analytics dashboards, and user governance.
- Zero-configuration local startup (SQLite default) with full Docker + PostgreSQL production readiness.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, React Router v6, Canvas Confetti |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, Python-Jose (JWT), Bcrypt, Aiofiles |
| **AI / Forensics** | OpenCV Headless, NumPy, SciPy, Pillow, ReportLab, Spectral Envelope & 2D FFT Analysis |
| **Database** | SQLite (out-of-the-box zero-setup default) / PostgreSQL (production Docker) |
| **DevOps / Testing**| Docker, Docker Compose, Nginx, Pytest, Httpx |

---

## 3. System Architecture

```
User Browser
    │
    ▼
React 19 + TypeScript Frontend (Vite, Tailwind CSS, Recharts)
    │  REST APIs (JWT Bearer Auth)
    ▼
FastAPI Backend Gateway
    ├── Auth & Role-Based Access Control (USER, ADMIN)
    ├── Secure File Ingestion Pipeline (SHA-256, MIME & Size Locks)
    ├── PDF Forensic Report Engine (ReportLab)
    │
    ▼
Modular AI Detection Engine (`backend/app/ai/`)
    ├── Preprocessors (Image, Video, Audio)
    ├── Feature Extractors
    │    ├── 2D FFT Frequency Distribution & Grid Attenuation
    │    ├── Error Level Analysis (ELA) Compression Residue
    │    ├── Laplacian Boundary Edge Gradients & Face Symmetry
    │    ├── Video Keyframe Inter-frame Optical Flow & Jitter
    │    └── Audio Spectral Centroid, ZCR & Vocoder Flatness
    ├── Explainability Generators
    │    ├── Thermal Anomaly Heatmaps & Overlays
    │    ├── Video Temporal Keyframe Timelines
    │    └── Audio Harmonic & Phonetic Segment Markers
    └── Pluggable Model Hook (`MODEL_PATH` / PyTorch / ONNX)
    │
    ▼
Database & Evidence Storage (SQLite / PostgreSQL, Uploads, Reports)
```

---

## 4. Default Demonstration Accounts

For out-of-the-box evaluation and testing, the database automatically includes:

| Account Type | Email | Password | Role |
|---|---|---|---|
| **System Administrator** | `admin@deepguard.ai` | `Admin@123456` | `ADMIN` |
| **Forensic Analyst** | `user@deepguard.ai` | `User@123456` | `USER` |

*(You can also register any new account freely through the registration portal).*

---

## 5. Getting Started (Local Development)

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 24 recommended) & **npm**

---

### Step 1: Run Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial database with sample forensic cases
python -m app.database.seed_data

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Swagger Interactive API Docs: `http://localhost:8000/docs`

---

### Step 2: Run Frontend

```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Frontend web application will be accessible at: `http://localhost:5173`

---

## 6. Running with Docker Compose

Run the entire full-stack application (Frontend, Backend, PostgreSQL) with a single command:

```bash
docker-compose up --build
```
- **Web Application UI**: `http://localhost:3000`
- **FastAPI REST Service**: `http://localhost:8000`
- **PostgreSQL Database**: `localhost:5432`

---

## 7. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create new user account.
- `POST /api/auth/login`: Authenticate with email/password and receive JWT.
- `GET /api/auth/me`: Retrieve current user profile.
- `PATCH /api/auth/profile`: Update analyst name or password.
- `POST /api/auth/logout`: Revoke active session.

### Media Analysis (`/api/analysis`)
- `POST /api/analysis/upload`: Secure multipart upload with SHA-256 cryptographic verification.
- `POST /api/analysis/{id}/run`: Execute multi-modal forensic detection pipeline.
- `GET /api/analysis/{id}`: Detailed examination output, indicators, and metadata.
- `GET /api/analysis`: List analyses with search, filters (media_type, result), sorting, and pagination.
- `DELETE /api/analysis/{id}`: Purge analysis record and evidence media from server.
- `GET /api/analysis/{id}/report`: Download formal certified PDF forensic certificate.
- `GET /api/analysis/heatmaps/{filename}`: Retrieve generated explainability heatmap.
- `GET /api/analysis/media/{filename}`: Stream ingested evidence for playback.

### Dashboard & Telemetry (`/api/dashboard`)
- `GET /api/dashboard/stats`: Aggregate detection statistics and confidence averages.
- `GET /api/dashboard/trends`: Chronological volume and risk distribution analytics.

### Administration (`/api/admin`)
- `GET /api/admin/users`: User list and analysis volume statistics.
- `PATCH /api/admin/users/{id}/status`: Enable or disable investigator accounts.
- `GET /api/admin/audit-logs`: Immutable security audit trail.
- `GET /api/admin/system-health`: Database, engine, and storage telemetry.

---

## 8. AI Model Extensibility & Real Model Integration

The detection engine in `backend/app/ai/detectors/` is architected with a modular `BaseDetector` interface:

```python
class BaseDetector(ABC):
    @abstractmethod
    def detect(self, file_path: Path, original_filename: str) -> DetectionOutput:
        pass
```

### Loading Real Weights:
To connect trained neural network checkpoints (e.g. EfficientNet-B4, Xception, MesoNet, Wav2Vec 2.0, or FaceForensics++ models):
1. Place checkpoint weights in `backend/models/`.
2. Set `DEMO_MODE=false` in `backend/.env`.
3. The `ImageDeepfakeDetector`, `VideoDeepfakeDetector`, and `AudioDeepfakeDetector` will load PyTorch/ONNX models directly from `MODEL_PATH`.

---

## 9. Automated Testing

### Run Backend Pytest Suite:
```bash
cd backend
pytest -v
```
Tests include:
- `test_register_and_login`: User registration, JWT issuance, `/me` profile check.
- `test_admin_access`: Administrator role enforcement and user list query.
- `test_upload_and_analyze_image`: End-to-end image ingestion, feature extraction, and PDF report generation.

### Run Frontend Typecheck & Build:
```bash
cd frontend
npm run build
```

---

## 10. Scientific & Legal Disclaimer

> **Notice:** Deepfake detection is probabilistic. AI-generated scores and metrics should not be interpreted as absolute proof that media is authentic or manipulated. Results may contain false positives and false negatives due to video transcoding, aggressive compression quantization, or transmission noise. For legal, judicial, investigative, or enterprise compliance decisions, automated reports must be reviewed by qualified digital forensics experts alongside secondary evidence.
