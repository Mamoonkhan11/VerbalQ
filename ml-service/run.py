#!/usr/bin/env python3
"""
Run script for the NLP Services API.

This script starts the FastAPI server with optimal settings for development.
"""

import uvicorn
import os

if __name__ == "__main__":
    # Disable Hugging Face symlinks warning on Windows
    os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info",
        access_log=True
    )