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
    Check text for plagiarism using semantic similarity.
    
    Uses sentence-transformers embeddings to detect:
    - Direct copying (high similarity > 0.85)
    - Paraphrased content (medium similarity 0.70-0.85)
    - Semantic similarity (meaning-based detection)
    
    Returns:
    - plagiarismScore: Overall percentage of plagiarized content
    - riskLevel: Low/Medium/High/Severe risk assessment
    - matchedSentences: List of similar sentences with similarity scores
    - totalSentences: Number of sentences analyzed
    """
    try:
        result = plagiarism_service.check_plagiarism(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "PLAGIARISM_SERVICE_ERROR",
                "message": str(e)
            }
        )