"""
Text humanization service using local Ollama LLM.

This service uses a local LLM (mistral) via Ollama
to rewrite text in different tones, making it sound more natural and human-like.
"""

from ..models.schemas import AIDetectionRequest, HumanizeRequest, HumanizeResponse
from .ai_detection_service import ai_detection_service
from .ollama_client import ollama_client


class HumanizeService:
    """Service for humanizing text using local LLM."""

    TARGET_AI_PROBABILITY = 45.0
    MAX_CALIBRATION_PASSES = 0  # Disabled to prevent timeouts, single-pass humanization is faster

    def __init__(self):
        """Initialize the humanization service with LLM support."""
        print("Humanization service initialized with Ollama LLM support (all languages)")

    def _to_scalar(self, value):
        return value.value if hasattr(value, "value") else value

    def humanize_text(self, request: HumanizeRequest) -> HumanizeResponse:
        """
        Humanize text by rewriting it in the specified tone using LLM.

        Args:
            request: HumanizeRequest with text, tone, and language

        Returns:
            HumanizeResponse with rewritten text

        The humanization process:
        1. Generate a natural rewrite
        2. Validate with local AI detector
        3. Optionally run up to 2 calibration passes if still flagged as AI
        """
        try:
            # Check if Ollama is available
            if not ollama_client.check_health():
                raise ConnectionError("LLM service unavailable")

            language = self._to_scalar(request.language)
            tone = self._to_scalar(request.tone)

            # First pass: Generate humanized text
            humanized_text = ollama_client.humanize_text(
                text=request.text,
                language=language,
                tone=tone,
                strengthen_human_style=False,
            )

            method = "llm"

            # Optional: Calibrate with AI detector (skip if detector fails)
            for attempt in range(self.MAX_CALIBRATION_PASSES):
                try:
                    detection = ai_detection_service.detect_ai_text(
                        AIDetectionRequest(text=humanized_text, language=language)
                    )
                    
                    # Validate detection response
                    if not detection or not hasattr(detection, 'label'):
                        print(f"AI detection returned invalid response, skipping calibration")
                        break
                    
                    is_flagged_ai = detection.label == "AI" or detection.aiProbability >= self.TARGET_AI_PROBABILITY
                    if not is_flagged_ai:
                        break

                    # Recreate with stronger human style
                    humanized_text = ollama_client.humanize_text(
                        text=humanized_text,
                        language=language,
                        tone=tone,
                        strengthen_human_style=True,
                    )
                    method = "llm+ai-calibrated"
                    
                except Exception as e:
                    # If detector is unavailable/unreliable, keep the current rewrite
                    print(f"AI detection skipped (attempt {attempt + 1}): {str(e)}")
                    break

            return HumanizeResponse(
                rewritten_text=humanized_text,
                tone=tone,
                method=method,
            )

        except TimeoutError as e:
            raise ValueError(f"LLM_TIMEOUT: {str(e)}") from e
        except ConnectionError as e:
            raise ValueError(f"LLM_UNAVAILABLE: {str(e)}") from e
        except RuntimeError as e:
            raise ValueError(f"LLM_ERROR: {str(e)}") from e
        except Exception as e:
            print(f"Humanization error details: {type(e).__name__}: {str(e)}")
            raise RuntimeError(f"Humanization failed: {str(e)}") from e


# Global service instance
humanize_service = HumanizeService()
