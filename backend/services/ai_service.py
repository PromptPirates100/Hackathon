import os
import json
import asyncio
from utils.logger import setup_logger

logger = setup_logger(__name__)

# Only import OpenAI if an API key is set
API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("MISTRAL_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.mistral.ai/v1")

USE_AI = bool(API_KEY)

if USE_AI:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)
else:
    client = None

class AIService:
    _instance = None
    is_ai_available = USE_AI          # <-- ADDED: public flag for agents

    def __init__(self):
        if USE_AI:
            logger.info(f"AI Service ready – using Mistral AI via {BASE_URL}")
        else:
            logger.warning("No API key set – AI calls will use built‑in rule engine")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def generate_text(self, prompt: str) -> dict:
        """
        Send a text prompt to Mistral and return parsed JSON.
        Falls back to the rule‑based engine if AI is unavailable.
        """
        if USE_AI:
            try:
                return await self._mistral_text(prompt)
            except Exception as e:
                logger.error(f"Mistral text generation failed: {e}")
        # Fallback to rule engine (the NEWS2‑based analyser)
        return self._rule_text(prompt)

    async def generate_vision(self, image_url: str, prompt: str = None) -> dict:
        """
        Analyse an image with Mistral Pixtral and return parsed JSON.
        Falls back to a neutral response if unavailable.
        """
        if USE_AI:
            try:
                return await self._mistral_vision(image_url, prompt)
            except Exception as e:
                logger.error(f"Mistral vision generation failed: {e}")
        return {
            "anomaly_detected": False,
            "confidence_score": 0,
            "finding": "Image analysis not available (AI offline or no key)",
            "highlight_region": None
        }

    # ------------------------------------------------------------------
    # Mistral AI methods (using OpenAI‑compatible SDK)
    # ------------------------------------------------------------------
    async def _mistral_text(self, prompt: str) -> dict:
        response = await client.chat.completions.create(
            model="mistral-small-latest",   # fast & capable; use "mistral-large-latest" for more power
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        return self._parse_json_response(response.choices[0].message.content)

    async def _mistral_vision(self, image_url: str, prompt: str = None) -> dict:
        user_content = [
            {"type": "text", "text": prompt or "Analyse this medical image for abnormalities."},
            {"type": "image_url", "image_url": {"url": image_url}}
        ]
        response = await client.chat.completions.create(
            model="pixtral-large-latest",   # Mistral vision model
            messages=[{"role": "user", "content": user_content}],
            temperature=0.2,
        )
        return self._parse_json_response(response.choices[0].message.content)

    # ------------------------------------------------------------------
    # Rule‑based fallback (NEWS2 + keyword analysis)
    # ------------------------------------------------------------------
    def _rule_text(self, prompt: str) -> dict:
        """
        Use the built‑in NEWS2 engine when Mistral is unavailable.
        """
        # Import here to avoid circular dependencies
        from services.news2_engine import analyse_prompt
        return analyse_prompt(prompt)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _parse_json_response(self, text: str) -> dict:
        """Extract JSON from model output, even if wrapped in markdown."""
        if not text:
            return {}
        text = text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON from AI: {text[:200]}")
            return {"error": "AI response not valid JSON"}