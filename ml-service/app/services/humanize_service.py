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
    MAX_CALIBRATION_PASSES = 2

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
            if not ollama_client.check_health():
                raise ConnectionError("LLM service unavailable")

            language = self._to_scalar(request.language)
            tone = self._to_scalar(request.tone)

            humanized_text = ollama_client.humanize_text(
                text=request.text,
                language=language,
                tone=tone,
                strengthen_human_style=False,
            )

            method = "llm"

            for _ in range(self.MAX_CALIBRATION_PASSES):
                try:
                    detection = ai_detection_service.detect_ai_text(
                        AIDetectionRequest(text=humanized_text, language=language)
                    )
                except Exception:
                    # If detector is unavailable/unreliable, keep the current rewrite.
                    break

                is_flagged_ai = detection.label == "AI" or detection.aiProbability >= self.TARGET_AI_PROBABILITY
                if not is_flagged_ai:
                    break

                humanized_text = ollama_client.humanize_text(
                    text=humanized_text,
                    language=language,
                    tone=tone,
                    strengthen_human_style=True,
                )
                method = "llm+ai-calibrated"

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
            raise RuntimeError(f"Humanization failed: {str(e)}") from e


# Global service instance
humanize_service = HumanizeService()
