"""
AI handler using the latest google-genai SDK (replaces deprecated google.generativeai).
Uses Google Gemini 2.5 Flash for fast, structured JSON responses.
"""

import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("tn_election_api.ai")

# Migrate to the current google-genai SDK
try:
    from google import genai
    from google.genai import types
    USE_NEW_SDK = True
except ImportError:
    import google.generativeai as genai_legacy
    USE_NEW_SDK = False
    logger.warning("Using deprecated google.generativeai. Install google-genai for latest SDK.")

api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"')
if not api_key:
    logger.warning("GEMINI_API_KEY not set. AI features will fail.")

SYSTEM_PROMPT = """You are the 'Tamil Nadu Smart Election Assistant', an AI guide for the 2026 Tamil Nadu Assembly Election portal.

Understand the user's intent and return ONLY valid JSON in this exact format:
{
    "spoken_response": "Brief helpful response to the user.",
    "action": "navigate" | "scroll" | "highlight" | "none",
    "target": "page path or element ID"
}

Navigation targets:
- Home page: "/"
- Dashboard (candidates): "/dashboard"
- EVM education: "/education"
- Voting day / polling booth: "/voting-day"

Rules:
- Keep spoken_response under 30 words
- Always return valid JSON, no markdown
- Respond in the same language as the user (English or Tamil)
"""


def process_voice_intent(transcript: str, language: str = "en") -> dict:
    """
    Send a voice transcript to Gemini and get a structured navigation command.
    Uses google-genai SDK if available, falls back to google.generativeai.
    """
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured.")

    logger.info("Processing intent: '%s'", transcript[:80])

    try:
        if USE_NEW_SDK:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=transcript,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    temperature=0.2,
                    max_output_tokens=256,
                ),
            )
            raw = response.text
        else:
            # Fallback: deprecated SDK
            genai_legacy.configure(api_key=api_key)
            model = genai_legacy.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=SYSTEM_PROMPT,
            )
            response = model.generate_content(
                transcript,
                generation_config=genai_legacy.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                    max_output_tokens=256,
                ),
            )
            raw = response.text

        result = json.loads(raw)
        logger.info("AI response action: %s → %s", result.get("action"), result.get("target"))
        return result

    except json.JSONDecodeError as e:
        logger.error("Failed to parse AI JSON response: %s", e)
        return {"spoken_response": "I understood you, but couldn't format a response.", "action": "none", "target": ""}
    except Exception as e:
        logger.error("Gemini API call failed: %s", e)
        raise ValueError(f"AI processing failed: {str(e)}")
