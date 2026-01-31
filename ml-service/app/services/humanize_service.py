"""
Text humanization service using local Ollama LLM.

This service uses a local LLM (llama3 or mistral) via Ollama
to rewrite text in different tones, making it sound more natural and human-like.
"""

from ..models.schemas import HumanizeRequest, HumanizeResponse
from .ollama_client import ollama_client


class HumanizeService:
    """Service for humanizing text using local LLM."""

    def __init__(self):
        """Initialize the humanization service with LLM support."""
        print("Humanization service initialized with Ollama LLM support (all languages)")

    def humanize_text(self, request: HumanizeRequest) -> HumanizeResponse:
        """
        Humanize text by rewriting it in the specified tone using LLM.

        Args:
            request: HumanizeRequest with text, tone, and language

        Returns:
            HumanizeResponse with rewritten text

        The humanization process:
        1. Send text to Ollama LLM with tone-specific prompt
        2. Return humanized text
        """
        try:
            # Check if Ollama is available
            if not ollama_client.check_health():
                raise ConnectionError("LLM service unavailable")

            # Use LLM to humanize text
            humanized_text = ollama_client.humanize_text(
                text=request.text,
                language=request.language.value if hasattr(request.language, 'value') else request.language,
                tone=request.tone.value if hasattr(request.tone, 'value') else request.tone
            )

            return HumanizeResponse(
                rewritten_text=humanized_text,
                tone=request.tone.value if hasattr(request.tone, 'value') else request.tone,
                method="llm"
            )

        except ConnectionError as e:
            raise ValueError(f"LLM_UNAVAILABLE: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Humanization failed: {str(e)}")


# Global service instance
humanize_service = HumanizeService()
