"""
Text humanization router.

Provides endpoints for humanizing AI-generated text in different tones.
"""

from fastapi import APIRouter, HTTPException
from ..services.humanize_service import humanize_service
from ..models.schemas import HumanizeRequest, HumanizeResponse


router = APIRouter(prefix="/humanize", tags=["humanize"])


@router.post("", response_model=HumanizeResponse)
async def humanize_text(request: HumanizeRequest):
    """
    Humanize AI-generated text by rewriting it using local LLM.

    Available tones:
    - professional: Formal, business-appropriate language
    - casual: Conversational, friendly tone
    - academic: Scholarly, formal academic writing
    - creative: Imaginative, engaging expression

    Uses Ollama LLM (mistral) to rewrite text while maintaining meaning.
    Supports all languages.
    """
    try:
        result = humanize_service.humanize_text(request)
        return result
    except ValueError as e:
        error_msg = str(e)
        if "LLM_UNAVAILABLE" in error_msg:
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "error": "LLM_UNAVAILABLE",
                    "message": "Local LLM service is unavailable. Please ensure Ollama is running.",
                },
            )
        if "LLM_TIMEOUT" in error_msg:
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "error": "LLM_TIMEOUT",
                    "message": "Humanization timed out. Try shorter text or retry when system load is lower.",
                },
            )
        if "LLM_ERROR" in error_msg:
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "error": "LLM_ERROR",
                    "message": error_msg.replace("LLM_ERROR: ", ""),
                },
            )
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "HUMANIZE_ERROR",
                "message": error_msg,
            },
        )
    except ConnectionError:
        # Handle direct ConnectionError (e.g., when Ollama is down)
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": "LLM_UNAVAILABLE",
                "message": "Local LLM service is unavailable. Please ensure Ollama is running.",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "SERVICE_ERROR",
                "message": f"Humanization failed: {str(e)}",
            },
        )
