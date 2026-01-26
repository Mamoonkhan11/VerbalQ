"""
Main FastAPI application for NLP services.

This application provides REST endpoints for various NLP operations:
- Grammar checking
- Text translation
- Text humanization
- Plagiarism detection
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import os

# Disable Hugging Face symlinks warning on Windows
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

from .routers import grammar, translation, humanize, plagiarism
from .models.schemas import HealthResponse


# Create FastAPI application
app = FastAPI(
    title="NLP Services API",
    description="AI-powered NLP services for text processing",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(grammar.router)
app.include_router(translation.router)
app.include_router(humanize.router)
app.include_router(plagiarism.router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify service availability.

    Returns service status and version information.
    """
    return HealthResponse(
        status="OK",
        version="1.0.0",
        services={
            "grammar": "LanguageTool",
            "translation": "MarianMT",
            "humanization": "BART",
            "plagiarism": "TF-IDF + Cosine Similarity"
        }
    )


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware to add processing time header to all responses.
    Useful for monitoring and debugging.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )