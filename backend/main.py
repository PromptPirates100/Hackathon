import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import analyze, patients, alerts, analytics
from services.websocket_manager import websocket_endpoint
from utils.logger import setup_logger


load_dotenv()
logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("PulseGrid AI backend starting...")
    try:
        from services.database_service import DatabaseService
        await DatabaseService.initialize()
        logger.info("[OK] MongoDB connected successfully")
    except Exception as e:
        logger.warning(f"[WARN] MongoDB unavailable: {e}")
        logger.warning("[INFO] Falling back to in-memory store — data persists for this session only")
        from services.database_service import DatabaseService
        DatabaseService.use_memory_fallback()
    yield
    logger.info("Shutting down PulseGrid AI...")

app = FastAPI(
    title="PulseGrid AI",
    description="Multi-Agent Emergency Intelligence & Triage Coordination System",
    version="1.0.0",
    lifespan=lifespan
)

# Allow React frontend (dev + prod) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/analyze", tags=["Analysis"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

app.websocket("/ws")(websocket_endpoint)

@app.get("/")
async def root():
    return {"message": "PulseGrid AI Backend Operational"}