# agents/triage_agent.py
from typing import Optional
from services.ai_service import AIService
from agents.intake_agent import IntakeAgent
from agents.imaging_agent import ImagingAgent
from utils.prompts import TRIAGE_COMBINATION_PROMPT
from utils.logger import setup_logger

logger = setup_logger(__name__)

class TriageAgent:
    @staticmethod
    async def assess(
        age: int,
        symptoms: list,
        vitals: dict,
        notes: str,
        image_url: Optional[str] = None
    ) -> dict:
        # Step 1: Intake analysis (rule-based)
        intake_result = await IntakeAgent.analyze(symptoms, vitals, notes)

        # Step 2: Imaging (returns neutral response)
        if image_url:
            imaging_result = await ImagingAgent.analyze(image_url)
        else:
            imaging_result = {
                "anomaly_detected": False,
                "confidence_score": 0,
                "finding": "No image",
                "highlight_region": None
            }

        # Step 3: Final triage (rule-based engine)
        ai = AIService.get_instance()
        prompt = TRIAGE_COMBINATION_PROMPT.format(
            age=age,
            symptoms=symptoms,
            vitals=vitals,
            notes=notes,
            intake_summary=intake_result,
            imaging_findings=imaging_result
        )
        try:
            triage_result = await ai.generate_text(prompt)
            # Ensure required fields exist
            for key in ["severity", "priority", "risk_score", "recommendation", "reasoning"]:
                if key not in triage_result:
                    triage_result[key] = "Unknown" if key != "risk_score" else 50
            triage_result["risk_score"] = int(triage_result["risk_score"])
            return triage_result
        except Exception as e:
            logger.error(f"Triage agent failed: {e}")
            return {
                "severity": "moderate",
                "priority": "YELLOW",
                "risk_score": 60,
                "recommendation": "Further evaluation needed",
                "reasoning": ["AI triage unavailable, defaulting to moderate"]
            }