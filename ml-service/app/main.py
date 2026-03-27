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

# ... (rest of your health and language endpoints) ...

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
