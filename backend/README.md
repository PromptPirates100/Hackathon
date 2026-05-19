# PulseGrid AI Backend

Multi-Agent Emergency Intelligence & Triage Coordination System.

## Tech Stack
- FastAPI (Python)
- MongoDB Atlas (async Motor)
- Google Gemini API (text & vision)
- WebSockets for real-time alerts

## Setup
1. Clone repo and cd into backend/
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and fill credentials
4. Run: `uvicorn main:app --reload`

## API Endpoints
- `POST /analyze/intake` – symptom analysis
- `POST /analyze/image` – image anomaly detection
- `POST /analyze/triage` – full triage pipeline (saves patient, broadcasts alerts)
- `POST /analyze/logistics` – hospital and transfer coordination
- `GET/POST /patients` – manage patient records
- `GET /alerts` – recent critical alerts
- `GET /analytics` – operational statistics
- `WS /ws` – real-time dashboard updates (critical alerts)

## Important
This system is AI-assisted decision-support only, not for autonomous diagnosis.