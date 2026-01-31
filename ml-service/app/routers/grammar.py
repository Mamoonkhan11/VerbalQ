"""
Grammar checking router.

Provides endpoints for checking and correcting grammar in text.
"""

from fastapi import APIRouter, HTTPException
from ..services.grammar_service import grammar_service
from ..models.schemas import GrammarCheckRequest, GrammarCheckResponse

router = APIRouter(prefix="/grammar", tags=["grammar"])


@router.post("/check", response_model=GrammarCheckResponse)
async def check_grammar(request: GrammarCheckRequest):
    """
    Check grammar and provide corrections for the input text using local LLM.

    This endpoint uses Ollama (llama3/mistral) to analyze and correct:
    - Grammatical errors
    - Spelling mistakes
    - Style issues
    - Punctuation problems

    Supports all languages that the LLM can handle.

    Returns the corrected text.
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
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "SERVICE_ERROR",
                "message": f"Grammar checking failed: {str(e)}"
            }
        )