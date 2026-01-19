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
    Check grammar and provide corrections for the input text.

    This endpoint uses LanguageTool to analyze the text for:
    - Grammatical errors
    - Spelling mistakes
    - Style issues
    - Punctuation problems

    Returns the corrected text and a detailed list of issues found.
    """
    try:
        result = grammar_service.check_grammar(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Grammar checking service error: {str(e)}"
        )