"""
Grammar correction router.

Provides endpoints for checking and correcting grammar in text.
"""

from fastapi import APIRouter, HTTPException
from ..services.grammar_service import grammar_service
from ..models.schemas import GrammarCheckRequest, GrammarCheckResponse


router = APIRouter(prefix="/grammar", tags=["grammar"])


@router.post("/check", response_model=GrammarCheckResponse)
async def check_grammar(request: GrammarCheckRequest):
    """
    Check and correct grammar in provided text.

    This endpoint uses Ollama (mistral) to analyze and correct:
    - Spelling mistakes
    - Grammar errors
    - Punctuation issues
    - Syntax problems

    Supports multiple languages.
    """
    try:
        result = grammar_service.check_grammar(request)
        return result
    except ValueError as e:
        error_msg = str(e)
        if "LLM_UNAVAILABLE" in error_msg:
            raise HTTPException(
                status_code=503,
                detail={
                    "success": False,
                    "error": "LLM_UNAVAILABLE",
                    "message": "Local LLM service is unavailable. Please ensure Ollama is running."
                }
            )
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "GRAMMAR_ERROR",
                "message": error_msg
            }
        )
    except ConnectionError as e:
        # Handle direct ConnectionError (e.g., when Ollama is down)
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": "LLM_UNAVAILABLE",
                "message": "Local LLM service is unavailable. Please ensure Ollama is running."
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "SERVICE_ERROR",
                "message": f"Grammar correction failed: {str(e)}"
            }
        )