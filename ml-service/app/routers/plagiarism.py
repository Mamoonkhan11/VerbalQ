"""
Plagiarism detection router.

Provides endpoints for checking text against reference corpus for plagiarism.
"""

from fastapi import APIRouter, HTTPException
from ..services.plagiarism_service import plagiarism_service
from ..models.schemas import PlagiarismCheckRequest, PlagiarismCheckResponse

router = APIRouter(prefix="/plagiarism", tags=["plagiarism"])


@router.post("/check", response_model=PlagiarismCheckResponse)
async def check_plagiarism(request: PlagiarismCheckRequest):
    """
    Check text for plagiarism against reference corpus.

    Analyzes the input text using TF-IDF vectorization and cosine similarity
    to detect potential matches with existing documents in the reference corpus.

    Returns:
    - Overall similarity score (0-100%)
    - List of matched sentences with similarity scores
    - Boolean indicating if text is considered plagiarized
    """
    try:
        result = plagiarism_service.check_plagiarism(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Plagiarism detection service error: {str(e)}"
        )