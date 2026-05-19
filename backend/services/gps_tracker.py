# services/gps_tracker.py
from fastapi import WebSocket
from typing import Dict, Optional
from utils.logger import setup_logger

logger = setup_logger(__name__)

class GPSTracker:
    """Stores the latest GPS coordinates per patient / device."""
    def __init__(self):
        # patient_id → {"lat": float, "lon": float, "timestamp": float}
        self.locations: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, patient_id: str):
        await websocket.accept()
        logger.info(f"GPS WebSocket connected – patient {patient_id}")
        try:
            while True:
                data = await websocket.receive_json()
                lat = data.get("lat")
                lng = data.get("lng")
                if lat is not None and lng is not None:
                    self.locations[patient_id] = {
                        "lat": float(lat),
                        "lon": float(lng),
                        "timestamp": data.get("timestamp")
                    }
                    logger.info(f"GPS update: patient {patient_id} → ({lat}, {lng})")
        except Exception:
            logger.info(f"GPS WebSocket disconnected – patient {patient_id}")
            self.locations.pop(patient_id, None)

    def get_location(self, patient_id: str) -> Optional[dict]:
        return self.locations.get(patient_id)

gps_tracker = GPSTracker()