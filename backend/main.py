import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
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
        logger.info("Database connected successfully")
    except Exception as e:
        logger.warning(f"Database not available: {e}")
        logger.warning("Running without database – some endpoints will fail")
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="PulseGrid AI",
    description="Multi-Agent Emergency Intelligence & Triage Coordination System",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(analyze.router, prefix="/analyze", tags=["Analysis"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

app.websocket("/ws")(websocket_endpoint)

@app.get("/")
async def root():
    return {"message": "PulseGrid AI Backend Operational"}