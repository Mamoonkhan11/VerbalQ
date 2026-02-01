"""
AI text detection service using local Ollama LLM.

This service uses a local LLM (mistral) via Ollama
to detect whether text is AI-generated or human-written based on writing style.
"""

import requests
import json
from typing import Dict, Optional
import re
from ..models.schemas import AIDetectionRequest, AIDetectionResponse
from ..config import OLLAMA_URL, OLLAMA_MODEL


class AIDetectionService:
    """Service for detecting AI-generated text using local LLM."""

    def __init__(self):
        """Initialize the AI detection service with LLM support."""
        print("AI Detection service initialized with Ollama LLM support (mistral)")

    def detect_ai_text(self, request: AIDetectionRequest) -> AIDetectionResponse:
        """
        Detect if text is AI-generated or human-written using LLM classification.
        
        Args:
            request: AIDetectionRequest with text to analyze
            
        Returns:
            AIDetectionResponse with probabilities and classification
            
        The detection process:
        1. Send text to Ollama LLM with classification prompt
        2. Parse structured JSON response
        3. Return probability scores and confidence level
        """
        try:
            # Prepare the classification prompt
            prompt = f"""You are an AI text detection expert.

Analyze the writing style and classify whether the text is AI-generated or Human-written.

Check:
- repetition
- unnatural phrasing
- overly perfect grammar
- predictable sentence structure
- lack of personal tone
- robotic patterns

Return ONLY valid JSON in this format:

{{
  "ai_probability": number between 0 and 100,
  "human_probability": number between 0 and 100,
  "label": "AI" or "Human",
  "confidence": "Low" | "Medium" | "High"
}}

Text:
\"\"\"{request.text}\"\"\""""

            # Prepare payload for Ollama
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,  # Low temperature for more consistent results
                    "top_p": 0.9,
                }
            }

            # Call Ollama API
            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload,
                timeout=60  # 60 second timeout
            )

            if response.status_code != 200:
                raise RuntimeError(f"Ollama returned status {response.status_code}: {response.text}")

            # Parse the response
            data = response.json()
            response_text = data.get("response", "")

            # Extract JSON from response (might have extra text before/after)
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if not json_match:
                raise ValueError("Could not extract JSON from LLM response")
            
            json_str = json_match.group()
            result = json.loads(json_str)

            # Validate the result has required fields
            required_fields = ["ai_probability", "human_probability", "label", "confidence"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field '{field}' in LLM response")

            # Create and return response
            return AIDetectionResponse(
                aiProbability=result["ai_probability"],
                humanProbability=result["human_probability"],
                label=result["label"],
                confidence=result["confidence"]
            )

        except requests.exceptions.ConnectionError:
            raise ConnectionError("LLM service unavailable")
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON response from LLM")
        except Exception as e:
            raise RuntimeError(f"AI detection failed: {str(e)}")


# Global service instance
ai_detection_service = AIDetectionService()