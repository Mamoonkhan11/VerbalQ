"""
Grammar correction service using local Ollama LLM.

This service uses a local LLM (mistral) via Ollama
to correct grammar in various languages.
"""

from ..models.schemas import GrammarCheckRequest, GrammarCheckResponse
from .ollama_client import ollama_client


class GrammarService:
    """Service for checking and correcting grammar using local LLM."""

    def __init__(self):
        """Initialize the grammar service with LLM support."""
        print("Grammar service initialized with Ollama LLM support (all languages)")

    def check_grammar(self, request: GrammarCheckRequest) -> GrammarCheckResponse:
        """
        Check grammar of the input text using LLM.

        Args:
            request: GrammarCheckRequest containing the text and language to check

        Returns:
            GrammarCheckResponse with corrected text

        The process:
        1. Send text to Ollama LLM with grammar correction prompt
        2. Return corrected text
        """
        try:
            # Check if Ollama is available
            if not ollama_client.check_health():
                raise ConnectionError("LLM service unavailable")

            # Use LLM to correct grammar
            corrected_text = ollama_client.correct_grammar(
                text=request.text,
                language=request.language.value if hasattr(request.language, 'value') else request.language
            )

            return GrammarCheckResponse(
                corrected_text=corrected_text,
                method="llm"
            )

        except ConnectionError as e:
            raise ValueError(f"LLM_UNAVAILABLE: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Grammar correction failed: {str(e)}")


# Global service instance
grammar_service = GrammarService()
