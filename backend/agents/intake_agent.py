from services.ai_service import AIService
from utils.prompts import INTAKE_PROMPT
from utils.logger import setup_logger

logger = setup_logger(__name__)

class IntakeAgent:
    @staticmethod
    async def analyze(symptoms: list, vitals: dict, notes: str) -> dict:
        prompt = INTAKE_PROMPT.format(
            symptoms=symptoms,
            vitals=vitals,
            notes=notes
        )
        ai = AIService.get_instance()
        try:
            result = await ai.generate_text(prompt)
            required_keys = ["summary", "possible_condition", "emergency_level", "risk_indicators"]
            for key in required_keys:
                if key not in result:
                    result[key] = "Unknown"
            return result
        except Exception as e:
            logger.error(f"Intake agent failed: {e}")
            return {
                "summary": "AI analysis unavailable",
                "possible_condition": "Unknown",
                "emergency_level": "medium",
                "risk_indicators": []
            }