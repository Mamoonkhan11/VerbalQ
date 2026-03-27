"""""
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
import nltk  

from .routers import grammar, translation, humanize, plagiarism, ai_detection
from .models.schemas import HealthResponse, LanguageResponse, TranslationLanguagesResponse

# Create FastAPI application
app = FastAPI(
    title="NLP Services API",
    description="AI-powered NLP services for text processing",
    version="1.0.0",
)

# --- NEW: NLTK DATA DOWNLOAD ON STARTUP ---
@app.on_event("startup")
async def startup_event():
    """
    Download necessary NLTK data when the application starts.
    """
    try:
        # These are the specific resources your error mentioned
        nltk.download('punkt_tab')
        nltk.download('punkt')
        nltk.download('stopwords')
        print("✅ NLTK data downloaded successfully.")
    except Exception as e:
        print(f" Error downloading NLTK data: {e}")

# Configure CORS
# Update allow_origins with your Netlify URL for better security later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(grammar.router)
app.include_router(translation.router)
app.include_router(humanize.router)
app.include_router(plagiarism.router)
app.include_router(ai_detection.router)

<<<<<<< HEAD

@app.get("/health", response_model=HealthResponse)
@app.get("/", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify service availability.

    Returns service status and version information.
    This endpoint is used by Railway and other deployment platforms.
    
    Note: Also accessible via root '/' for compatibility.
    """
    return HealthResponse(
        status="ok",  # lowercase for Railway compatibility
        version="1.0.0",
        services={
            "grammar": "operational",
            "translation": "operational",
            "humanization": "operational",
            "plagiarism": "operational",
            "ai_detection": "operational"
        }
    )


@app.get("/languages", response_model=LanguageResponse)
async def get_languages():
    """
    Get list of supported languages for all services.
    """
    languages = [
        {"code": "en", "name": "English"},
        {"code": "hi", "name": "Hindi"},
        {"code": "fr", "name": "French"},
        {"code": "de", "name": "German"},
        {"code": "es", "name": "Spanish"},
        {"code": "ko", "name": "Korean"},
        {"code": "ar", "name": "Arabic"},
        {"code": "zh", "name": "Chinese"}
    ]
    
    return LanguageResponse(
        success=True,
        languages=languages
    )


@app.get("/translate/languages", response_model=TranslationLanguagesResponse)
async def get_translation_languages():
    """
    Get supported translation language pairs.
    """
    # Common translation pairs
    supported_pairs = [
        {"from_lang": "en", "to_lang": "es"},
        {"from_lang": "en", "to_lang": "fr"},
        {"from_lang": "en", "to_lang": "de"},
        {"from_lang": "en", "to_lang": "hi"},
        {"from_lang": "en", "to_lang": "ar"},
        {"from_lang": "en", "to_lang": "zh"},
        {"from_lang": "en", "to_lang": "ko"},
        {"from_lang": "es", "to_lang": "en"},
        {"from_lang": "fr", "to_lang": "en"},
        {"from_lang": "de", "to_lang": "en"},
        {"from_lang": "hi", "to_lang": "en"},
        {"from_lang": "ar", "to_lang": "en"},
        {"from_lang": "zh", "to_lang": "en"},
        {"from_lang": "ko", "to_lang": "en"}
    ]
    
    return TranslationLanguagesResponse(
        success=True,
        supportedPairs=supported_pairs
    )

=======
# ... (rest of your health and language endpoints) ...
>>>>>>> 72ae3df3592912ff38aa4433643156f2b3579952

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

if __name__ == "__main__":
    import uvicorn
    # --- UPDATED: Dynamic Port for Railway/Render ---
    port = int(os.environ.get("PORT", 8001))
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,      # Use the environment variable
        reload=False,   # Set to False for production stability
        log_level="info"
)
