import time
import uuid
from fastapi import APIRouter, HTTPException
from models.patient_model import PatientInput
from agents.intake_agent import IntakeAgent
from agents.imaging_agent import ImagingAgent
from agents.triage_agent import TriageAgent
from agents.logistics_agent import LogisticsAgent
from services.websocket_manager import manager
from services.database_service import DatabaseService
from services.gps_tracker import gps_tracker           # new – live GPS storage
from utils.logger import setup_logger
import aiohttp

router = APIRouter()
logger = setup_logger(__name__)

# ------------------------------------------------------------------
#  Existing endpoints (unchanged)
# ------------------------------------------------------------------
@router.post("/intake")
async def analyze_intake(symptoms: list[str], vitals: dict, notes: str = ""):
    try:
        result = await IntakeAgent.analyze(symptoms, vitals, notes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image")
async def analyze_image(image_url: str):
    try:
        result = await ImagingAgent.analyze(image_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/triage")
async def run_triage(patient: PatientInput):
    try:
        vitals = {
            "oxygen": patient.oxygen,
            "bp": patient.bp,
            "heart_rate": patient.heart_rate
        }
        triage_result = await TriageAgent.assess(
            age=patient.age,
            symptoms=patient.symptoms,
            vitals=vitals,
            notes=patient.notes,
            image_url=patient.image_url
        )

        logistics_result = None
        if patient.location and triage_result["priority"] == "RED":
            logistics_result = await LogisticsAgent.plan(
                severity=triage_result["severity"],
                priority=triage_result["priority"],
                risk_score=triage_result["risk_score"],
                location=patient.location
            )

        patient_id = str(uuid.uuid4())
        record = {
            "patient_id": patient_id,
            "patient_name": patient.patient_name,
            "age": patient.age,
            "symptoms": patient.symptoms,
            "vitals": vitals,
            "notes": patient.notes,
            "location": patient.location,
            "image_url": patient.image_url,
            "triage": triage_result,
            "logistics": logistics_result,
            "timestamp": time.time(),
            "status": "active"
        }

        try:
            db = DatabaseService.get_collection("patients")
            await db.insert_one(record)
        except Exception as db_err:
            logger.warning(f"Database save failed: {db_err}")

        if triage_result["priority"] == "RED":
            alert = {
                "type": "critical_patient",
                "patient_id": patient_id,
                "patient_name": patient.patient_name,
                "severity": triage_result["severity"],
                "priority": triage_result["priority"],
                "risk_score": triage_result["risk_score"],
                "timestamp": record["timestamp"]
            }
            await manager.broadcast(alert)
            try:
                alerts_collection = DatabaseService.get_collection("alerts")
                await alerts_collection.insert_one(alert)
            except Exception:
                pass

        return {
            "patient_id": patient_id,
            "triage": triage_result,
            "logistics": logistics_result
        }
    except Exception as e:
        logger.error(f"Triage pipeline failed: {e}")
        raise HTTPException(status_code=500, detail="Emergency analysis failed")

@router.post("/logistics")
async def analyze_logistics(severity: str, priority: str, risk_score: int, location: str):
    try:
        result = await LogisticsAgent.plan(severity, priority, risk_score, location)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------------
#  NEW: Live GPS‑powered triage
# ------------------------------------------------------------------
@router.post("/triage/live")
async def live_triage(patient_id: str):
    """
    Finds the nearest hospitals using the latest GPS coordinates
    streamed via WebSocket (/ws/gps/{patient_id}).
    """
    location_data = gps_tracker.get_location(patient_id)
    if not location_data:
        raise HTTPException(status_code=404,
                            detail="No GPS data for this patient. Start streaming via /ws/gps first.")

    lat = location_data["lat"]
    lon = location_data["lon"]

    # Reverse geocode to show a human‑readable location
    location_str = await _reverse_geocode(lat, lon) or "Live GPS coordinates"

    # Run logistics directly with GPS (ignore any stored location string)
    logistics_result = await LogisticsAgent.plan(
        severity="moderate",      # you can replace with actual patient severity if known
        priority="YELLOW",
        risk_score=50,
        location=location_str,
        gps_lat=lat,
        gps_lon=lon
    )

    return {
        "patient_id": patient_id,
        "live_location": {"lat": lat, "lon": lon},
        "location_name": location_str,
        "logistics": logistics_result
    }

async def _reverse_geocode(lat: float, lon: float) -> str | None:
    """Convert GPS coordinates to an address using Nominatim."""
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json", "zoom": 14}
    headers = {"User-Agent": "PulseGridAI/1.0"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("display_name")
    except Exception as e:
        logger.warning(f"Reverse geocoding failed: {e}")
    return None