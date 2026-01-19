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
    Humanize AI-generated text by rewriting it in a specified tone.

    Available tones:
    - professional: Formal, business-appropriate language
    - casual: Conversational, friendly tone
    - academic: Scholarly, formal academic writing
    - creative: Imaginative, engaging expression

    Uses transformer models to rewrite text while maintaining meaning.
    """
    try:
        result = humanize_service.humanize_text(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Text humanization service error: {str(e)}"
        )