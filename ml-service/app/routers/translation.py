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
    """
    try:
        result = translation_service.translate(request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "TRANSLATION_NOT_SUPPORTED",
                "message": str(e)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "SERVICE_ERROR",
                "message": str(e)
            }
        )

@router.get("/languages")
async def get_supported_languages():
    """
    Get all supported translation language pairs.
    """
    return {
        "success": True,
        "supportedPairs": translation_service.get_supported_languages()
    }