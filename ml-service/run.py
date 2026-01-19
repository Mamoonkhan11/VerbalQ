#!/usr/bin/env python3
"""
Run script for the NLP Services API.

This script starts the FastAPI server with optimal settings for development.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info",
        access_log=True
    )