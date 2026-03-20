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
        def _coerce_number(value):
                """Coerce a value into a float in [0, 100] when possible."""
                if isinstance(value, (int, float)):
                    num = float(value)
                elif isinstance(value, str):
                    # handle "75%", "75.0", "75 / 100", etc.
                    cleaned = value.strip()
                    cleaned = cleaned.replace("%", "")
                    # take first number found
                    m = re.search(r"[-+]?\d*\.?\d+", cleaned)
                    if not m:
                        raise ValueError(f"Invalid numeric value: {value}")
                    num = float(m.group())
                else:
                    raise ValueError(f"Invalid numeric type: {type(value)}")

                # Clamp to [0, 100]
                return max(0.0, min(100.0, num))

        def _normalize_label(value: str) -> str:
            v = str(value).strip().lower()
            if v in ["ai", "a.i.", "ai-generated", "ai generated", "generated", "machine"]:
                return "AI"
            if v in ["human", "human-written", "human written", "person", "person-written"]:
                return "Human"
            # Default heuristic: treat unknown as Human to avoid hard failures
            return "Human"

        def _normalize_confidence(value: str) -> str:
            v = str(value).strip().lower()
            if v.startswith("h"):
                return "High"
            if v.startswith("m"):
                return "Medium"
            if v.startswith("l"):
                return "Low"
            return "Medium"

        def _try_parse_json_candidates(text: str) -> Dict:
                """
                LLMs sometimes wrap JSON in prose or return slightly invalid JSON.
                Try a few extraction strategies and parse the first valid object.
                """
                if not text or not text.strip():
                    raise ValueError("Empty LLM response")

                candidates = []

                # Strategy 1: smallest JSON object match (non-greedy)
                candidates.extend(re.findall(r"\{[\s\S]*?\}", text))

                # Strategy 2: from first { to last } (greedy)
                start = text.find("{")
                end = text.rfind("}")
                if start != -1 and end != -1 and end > start:
                    candidates.append(text[start : end + 1])

                def _sanitize(s: str) -> str:
                    s2 = s.strip()
                    # Replace single quotes with double quotes (common mistake)
                    if "'" in s2 and '"' not in s2:
                        s2 = s2.replace("'", '"')
                    # Remove trailing commas before } or ]
                    s2 = re.sub(r",(\s*[}\]])", r"\1", s2)
                    return s2

                last_err = None
                for c in candidates:
                    try:
                        return json.loads(_sanitize(c))
                    except Exception as e:
                        last_err = e
                        continue
                raise ValueError(f"Invalid JSON response from LLM: {last_err}")

        def _call_ollama_and_parse(req: AIDetectionRequest) -> Dict:
            """
            Call Ollama once and parse the JSON response.
            Raises:
              - ConnectionError for connectivity/LLM issues
              - RuntimeError for non-200 statuses (non-CUDA errors)
              - ValueError for JSON/formatting issues
            """
            # Prepare the classification prompt with detailed analysis criteria
            prompt = f"""You are an expert AI text detection analyst. Your task is to distinguish between human-written and AI-generated text.

Analyze the following text using these specific criteria:

**AI Indicators (increase ai_probability):**
- Unnaturally perfect grammar and spelling
- Repetitive sentence structures and patterns  
- Generic, safe statements without strong opinions
- Lack of personal anecdotes or specific details
- Overly formal or robotic tone
- Predictable word choices and phrasing
- No typos, slang, or colloquialisms
- Uniform sentence length throughout
- Absence of emotional nuance or personality

**Human Indicators (increase human_probability):**
- Natural variations in sentence structure
- Occasional minor errors or informal language
- Personal voice and emotional authenticity
- Specific examples and concrete details
- Varied vocabulary and creative expressions
- Colloquialisms, idioms, or cultural references
- Mixed sentence lengths (short + long)
- Subtle imperfections that show authentic thought

Language context: {req.language}

Text to analyze:
\"\"\"{req.text}\"\"\"

Return ONLY valid JSON with your analysis:
{{
  "ai_probability": <number 0-100>,
  "human_probability": <number 0-100>,
  "label": "AI" or "Human",
  "confidence": "Low", "Medium", or "High",
  "reasoning": "<brief explanation of key indicators found>"
}}

Scoring guidelines:
- 50-60: Slight indication either way
- 60-75: Moderate confidence
- 75-90: High confidence  
- 90-100: Very high confidence

IMPORTANT: ai_probability + human_probability should equal 100 (or very close).
Base your analysis SOLELY on writing style patterns, not content quality."""

            payload = {
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,  # Very low for consistent, analytical output
                    "top_p": 0.9,
                    "num_predict": 256,  # Enough for JSON + brief reasoning
                },
            }

            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json=payload,
                timeout=110,  # allow more time than the Node proxy (LLM inference can be slow)
            )

            if response.status_code != 200:
                # Ollama can crash (often GPU/CUDA-related). Treat these as "unavailable"
                # so the API returns 503 and the frontend can show a clear toast.
                err_text = (response.text or "").lower()
                if "cuda error" in err_text or "runner process has terminated" in err_text:
                    raise ConnectionError("LLM service unavailable")
                raise RuntimeError(f"Ollama returned status {response.status_code}: {response.text}")

            data = response.json()
            response_text = data.get("response", "")

            # Extract + parse JSON from response (might have extra text before/after)
            return _try_parse_json_candidates(response_text)

        try:
            # First attempt
            result = _call_ollama_and_parse(request)
        except ValueError:
            # JSON/format error: retry once as requested
            try:
                result = _call_ollama_and_parse(request)
            except ValueError as e:
                # After second failure, signal detection failure upstream
                raise ValueError("DETECTION_FAILED") from e

            # Validate the result has required fields
            required_fields = ["ai_probability", "human_probability", "label", "confidence"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field '{field}' in LLM response")
            
            # Post-process and validate results
            ai_prob = _coerce_number(result["ai_probability"])
            human_prob = _coerce_number(result["human_probability"])
            
            # Ensure probabilities sum to ~100 (allow small variance)
            total = ai_prob + human_prob
            if abs(total - 100) > 5:
                # Normalize if way off
                ai_prob = (ai_prob / total) * 100
                human_prob = (human_prob / total) * 100
            
            # Override label based on actual probabilities (trust numbers over LLM's label)
            calculated_label = "AI" if ai_prob >= 50 else "Human"
            
            # If LLM's label doesn't match calculated, trust the probabilities
            # This prevents LLM from saying "AI" while giving low ai_probability
            final_label = calculated_label
            
            # Build validated response
            return {
                "ai_probability": round(ai_prob, 1),
                "human_probability": round(human_prob, 1),
                "label": final_label,
                "confidence": _normalize_confidence(str(result.get("confidence", "Medium"))),
                "reasoning": result.get("reasoning", "Analysis based on writing style patterns"),
            }

        except TimeoutError as e:
            raise ValueError(f"DETECTION_TIMEOUT: {str(e)}") from e
        except ConnectionError as e:
            raise ValueError(f"DETECTION_UNAVAILABLE: {str(e)}") from e
        except RuntimeError as e:
            raise ValueError(f"DETECTION_ERROR: {str(e)}") from e
        except Exception as e:
            print(f"AI detection error details: {type(e).__name__}: {str(e)}")
            raise RuntimeError(f"Detection failed: {str(e)}") from e


# Global service instance
ai_detection_service = AIDetectionService()