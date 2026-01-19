"""
Translation router.

Provides endpoints for translating text between supported languages.
"""

from fastapi import APIRouter, HTTPException
from ..services.translation_service import translation_service
from ..models.schemas import TranslationRequest, TranslationResponse

router = APIRouter(prefix="/translate", tags=["translation"])


@router.post("", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text from source language to target language.

    Supported language pairs:
    - English ↔ Spanish (en-es, es-en)
    - English ↔ Hindi (en-hi, hi-en)
    - English ↔ Korean (en-ko, ko-en)

    Uses MarianMT transformer models for high-quality translation.
    """
    try:
        result = translation_service.translate(request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Translation service error: {str(e)}"
        )