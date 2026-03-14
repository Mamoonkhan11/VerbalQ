"""
AI text detection router.

Provides endpoints for detecting whether text is AI-generated or human-written.
"""

from fastapi import APIRouter, HTTPException
import re
from ..services.ai_detection_service import ai_detection_service
from ..models.schemas import AIDetectionRequest, AIDetectionResponse


router = APIRouter(prefix="/ai-detect", tags=["ai-detection"])

SUPPORTED_LANGUAGES = {"en", "es", "fr", "de", "hi", "ar", "zh", "ko"}


@router.post("/check", response_model=AIDetectionResponse)
async def check_ai_detection(request: AIDetectionRequest):
    """
    Check if text is AI-generated or human-written using local LLM.

    Applies language and length validation, basic normalization, then
    delegates to the detection service.
    """
    try:
        # Validate language explicitly against supported set
        language = (request.language or "en").strip().lower()
        if language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "LANGUAGE_NOT_SUPPORTED",
                    "message": "Language not supported",
                },
            )

        # Word-count based validation for reliability
        words = re.findall(r"\w+", request.text)
        word_count = len(words)
        if word_count < 50:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "TEXT_TOO_SHORT",
                    "message": "Text must contain at least 50 words",
                },
            )
        if word_count > 5000:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "TEXT_TOO_LONG",
                    "message": "Text must not exceed 5000 words",
                },
            )

        # Additional normalization: collapse whitespace and normalize punctuation
        normalized_text = " ".join(request.text.split())
        # remove spaces before punctuation like " word , word " -> " word, word "
        normalized_text = re.sub(r"\s+([?.!,;:])", r"\1", normalized_text)
        # collapse repeated punctuation "!!!" -> "!"
        normalized_text = re.sub(r"([?.!,;:]){2,}", r"\1", normalized_text)

        normalized_request = AIDetectionRequest(text=normalized_text, language=language)

        result = ai_detection_service.detect_ai_text(normalized_request)
        # The result is already an AIDetectionResponse object, return it directly
        return result
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ConnectionError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": "LLM_UNAVAILABLE",
                "message": "Local LLM service is unavailable. Please ensure Ollama is running.",
            },
        )
    except ValueError as e:
        error_msg = str(e)
        if "DETECTION_FAILED" in error_msg:
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "error": "DETECTION_FAILED",
                    "message": "Detection failed due to invalid LLM response.",
                },
            )
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "AI_DETECTION_ERROR",
                "message": error_msg,
            },
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": "LLM_ERROR",
                "message": str(e),
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "SERVICE_ERROR",
                "message": f"AI detection failed: {str(e)}",
            },
        )

