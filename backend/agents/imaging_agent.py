# agents/imaging_agent.py
from services.ai_service import AIService
from utils.prompts import IMAGING_PROMPT
from utils.logger import setup_logger

logger = setup_logger(__name__)

class ImagingAgent:
    @staticmethod
    async def analyze(image_url: str) -> dict:
        if not image_url:
            return {
                "anomaly_detected": False,
                "confidence_score": 0,
                "finding": "No image provided",
                "highlight_region": None
            }
        ai = AIService.get_instance()
        try:
            result = await ai.generate_vision(image_url, prompt=IMAGING_PROMPT.format(image_url=image_url))
            result.setdefault("anomaly_detected", False)
            result.setdefault("confidence_score", 0)
            result.setdefault("finding", "")
            result.setdefault("highlight_region", None)
            return result
        except Exception as e:
            logger.error(f"Imaging agent failed: {e}")
            return {
                "anomaly_detected": False,
                "confidence_score": 0,
                "finding": "Image analysis failed",
                "highlight_region": None
            }