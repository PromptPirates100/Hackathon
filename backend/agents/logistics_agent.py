import re
import aiohttp
import asyncio
from math import radians, cos, sin, asin, sqrt
from typing import Optional, List, Dict, Tuple
from services.ai_service import AIService
from utils.prompts import LOGISTICS_PROMPT
from utils.logger import setup_logger

logger = setup_logger(__name__)

# ------------------------------------------------------------------
# 1. Geocoding: Nominatim (free, no API key, 1 req/s limit)
# ------------------------------------------------------------------
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

async def geocode_location(location: str) -> Optional[Tuple[float, float]]:
    """Convert a location string to (lat, lon). Returns None on failure."""
    if not location:
        return None
    params = {"q": location, "format": "json", "limit": 1}
    headers = {"User-Agent": "PulseGridAI-Emergency-Triage/1.0"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(NOMINATIM_URL, params=params, headers=headers) as resp:
                if resp.status != 200:
                    logger.error(f"Nominatim geocoding failed: HTTP {resp.status}")
                    return None
                data = await resp.json()
                if data:
                    return (float(data[0]["lat"]), float(data[0]["lon"]))
    except Exception as e:
        logger.error(f"Nominatim error: {e}")
    return None

# ------------------------------------------------------------------
# 2. Hospital Search: Overpass API (free, no key)
# ------------------------------------------------------------------
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

async def get_nearby_hospitals(
    lat: float, lon: float, radius_m: int = 15000
) -> List[Dict]:
    """
    Query Overpass for hospitals and clinics within `radius_m` metres.
    Returns a list of dicts with: name, lat, lon, distance_km, amenity_type.
    """
    overpass_query = f"""
        [out:json][timeout:25];
        (
            node["amenity"="hospital"](around:{radius_m},{lat},{lon});
            way["amenity"="hospital"](around:{radius_m},{lat},{lon});
            relation["amenity"="hospital"](around:{radius_m},{lat},{lon});
            node["amenity"="clinic"](around:{radius_m},{lat},{lon});
            way["amenity"="clinic"](around:{radius_m},{lat},{lon});
            relation["amenity"="clinic"](around:{radius_m},{lat},{lon});
        );
        out center;
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(OVERPASS_URL, data={"data": overpass_query}) as resp:
                if resp.status != 200:
                    logger.error(f"Overpass API failed: HTTP {resp.status}")
                    return []
                data = await resp.json()
    except Exception as e:
        logger.error(f"Overpass API error: {e}")
        return []

    hospitals = []
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        name = tags.get("name", "Unknown Hospital")
        amenity_type = tags.get("amenity", "hospital")

        if "center" in element:
            h_lat = element["center"]["lat"]
            h_lon = element["center"]["lon"]
        elif "lat" in element:
            h_lat = element["lat"]
            h_lon = element["lon"]
        else:
            continue

        dist = haversine(lat, lon, h_lat, h_lon)
        hospitals.append({
            "name": name,
            "lat": h_lat,
            "lon": h_lon,
            "distance_km": round(dist, 2),
            "amenity_type": amenity_type
        })

    # Sort by straight-line distance and keep top 10
    hospitals.sort(key=lambda h: h["distance_km"])
    return hospitals[:10]

# ------------------------------------------------------------------
# 3. Routing: OSRM Demo Server (free, 1 req/s limit)
# ------------------------------------------------------------------
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"

async def get_route(
    from_lat: float, from_lon: float,
    to_lat: float, to_lon: float
) -> Optional[Dict]:
    """
    Get driving route from patient to hospital.
    Returns dict with: distance_km, duration_min, geometry (polyline).
    """
    coords = f"{from_lon},{from_lat};{to_lon},{to_lat}"
    params = {"overview": "full", "steps": "true", "geometries": "polyline"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{OSRM_URL}/{coords}", params=params) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json()
                if data.get("code") != "Ok":
                    return None
                route = data["routes"][0]
                return {
                    "distance_km": round(route["distance"] / 1000, 2),
                    "duration_min": round(route["duration"] / 60, 1),
                    "duration_sec": route["duration"],
                    "geometry": route.get("geometry", "")
                }
    except Exception as e:
        logger.error(f"OSRM routing error: {e}")
    return None

# ------------------------------------------------------------------
# 4. Distance helper: Haversine formula
# ------------------------------------------------------------------
def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return straight-line distance in kilometres."""
    r = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * r * asin(sqrt(a))

# ------------------------------------------------------------------
# 5. Urgency classification
# ------------------------------------------------------------------
def classify_urgency(severity: str) -> Dict[str, str]:
    sev = severity.lower() if severity else ""
    if "critical" in sev:
        return {"urgency": "Immediate transfer", "estimated_response": "3 mins"}
    elif "high" in sev:
        return {"urgency": "Urgent transfer", "estimated_response": "8 mins"}
    elif "moderate" in sev:
        return {"urgency": "Prioritised transfer", "estimated_response": "15 mins"}
    return {"urgency": "Routine transfer", "estimated_response": "25 mins"}

# ------------------------------------------------------------------
# LogisticsAgent – public interface
# ------------------------------------------------------------------
class LogisticsAgent:
    @staticmethod
    async def plan(
        severity: str,
        priority: str,
        risk_score: int,
        location: str,
        gps_lat: Optional[float] = None,
        gps_lon: Optional[float] = None
    ) -> dict:
        """
        Recommend the optimal hospital and transport urgency.
        Uses Mistral AI if available, otherwise real‑time geo‑services (free OSM APIs).
        """
        prompt = LOGISTICS_PROMPT.format(
            severity=severity,
            priority=priority,
            risk_score=risk_score,
            location=location
        )
        ai = AIService.get_instance()

        # --- Only trust AI response if a real API key is present ---
        if AIService.is_ai_available:
            try:
                result = await ai.generate_text(prompt)
                if all(k in result for k in ["nearest_hospital", "urgency", "estimated_response"]):
                    result.setdefault("transfer_notes", "")
                    return result
            except Exception as e:
                logger.warning(f"AI logistics call failed: {e}")

        # --- Fallback: real-time geo-services (no API key needed) ---
        return await LogisticsAgent._geo_plan(severity, location, gps_lat, gps_lon)

    @staticmethod
    async def _geo_plan(
        severity: str,
        location: str,
        gps_lat: Optional[float] = None,
        gps_lon: Optional[float] = None
    ) -> dict:
        """Real-time hospital search + routing using free OSM services."""
        urgency_info = classify_urgency(severity)

        # ---- Step 1: Determine coordinates ----
        if gps_lat is not None and gps_lon is not None:
            patient_lat, patient_lon = gps_lat, gps_lon
            logger.info(f"Using supplied GPS: ({patient_lat}, {patient_lon})")
        else:
            coords = await geocode_location(location)
            if not coords:
                return {
                    "nearest_hospital": "Unable to geocode location – dispatch manually",
                    "urgency": urgency_info["urgency"],
                    "estimated_response": urgency_info["estimated_response"],
                    "transfer_notes": f"Patient at '{location}'. Manual dispatch required."
                }
            patient_lat, patient_lon = coords
            logger.info(f"Geocoded '{location}' → ({patient_lat}, {patient_lon})")

        # ---- Step 2: Find hospitals ----
        hospitals = await get_nearby_hospitals(patient_lat, patient_lon, radius_m=15000)
        if not hospitals:
            return {
                "nearest_hospital": "No hospitals found within 15 km – expand search or call EMS",
                "urgency": urgency_info["urgency"],
                "estimated_response": urgency_info["estimated_response"],
                "transfer_notes": f"Patient at '{location}'. No OSM hospitals nearby."
            }

        # ---- Step 3: Calculate driving routes to top candidates ----
        ranked_hospitals = []
        for h in hospitals[:5]:  # route top 5
            route = await get_route(patient_lat, patient_lon, h["lat"], h["lon"])
            entry = {
                "name": h["name"],
                "straight_line_km": h["distance_km"],
                "route_distance_km": route["distance_km"] if route else None,
                "route_duration_min": route["duration_min"] if route else None,
                "lat": h["lat"],
                "lon": h["lon"],
                "amenity_type": h["amenity_type"]
            }
            ranked_hospitals.append(entry)
            await asyncio.sleep(0.05)  # small delay to respect OSRM rate limit

        # Sort by route duration (if available), else straight-line distance
        ranked_hospitals.sort(
            key=lambda h: h["route_duration_min"] if h["route_duration_min"] is not None else h["straight_line_km"] * 3
        )

        # ---- Step 4: Build response ----
        nearest = ranked_hospitals[0]
        if nearest["route_duration_min"]:
            eta_str = f"{nearest['route_duration_min']} mins ({nearest['route_distance_km']} km)"
        else:
            eta_str = urgency_info["estimated_response"]

        return {
            "nearest_hospital": nearest["name"],
            "urgency": urgency_info["urgency"],
            "estimated_response": eta_str,
            "transfer_notes": (
                f"Patient at '{location}' ({patient_lat}, {patient_lon}). "
                f"Nearest: {nearest['name']} ({nearest['route_distance_km'] or nearest['straight_line_km']} km by road)."
            ),
            "alternatives": ranked_hospitals[1:],
            "patient_coordinates": {"lat": patient_lat, "lon": patient_lon}
        }