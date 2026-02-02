"""
AI text detection router.

Provides endpoints for detecting whether text is AI-generated or human-written.
"""

from fastapi import APIRouter, HTTPException
from ..services.ai_detection_service import ai_detection_service
from ..models.schemas import AIDetectionRequest, AIDetectionResponse


router = APIRouter(prefix="/ai-detect", tags=["ai-detection"])


@router.post("/check", response_model=AIDetectionResponse)
async def check_ai_detection(request: AIDetectionRequest):
    """
    Check if text is AI-generated or human-written using local LLM.
    
    Uses mistral model to analyze writing style characteristics:
    - Repetition patterns
    - Unnatural phrasing
    - Overly perfect grammar
    - Predictable sentence structure
    - Lack of personal tone
    - Robotic patterns
    
    Returns probability scores for AI vs Human classification.
    """
    try:
        result = ai_detection_service.detect_ai_text(request)
        # The result is already an AIDetectionResponse object, return it directly
        return result
    except ConnectionError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": "LLM_UNAVAILABLE",
                "message": "Local LLM service is unavailable. Please ensure Ollama is running."
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "AI_DETECTION_ERROR",
                "message": str(e)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "SERVICE_ERROR",
                "message": f"AI detection failed: {str(e)}"
            }
        )