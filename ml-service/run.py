#!/usr/bin/env python3
import uvicorn
import os

if __name__ == "__main__":
    # Disable Hugging Face symlinks warning
    os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
    
    # Render provides a 'PORT' environment variable. 
    # We use that, or default to 8001 if running locally.
    port = int(os.environ.get("PORT", 8001))
    
    # Log startup information for debugging
    print(f"🚀 Starting ML Service on host=0.0.0.0 port={port}")
    print(f"📊 Environment: {'Render (PORT=' + str(port) + ')' if os.environ.get('PORT') else 'Local (default port 8001)'}")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,  # Use the dynamic port
        reload=False, # Set reload to False for production/Render
        log_level="info",
        access_log=True,
    )