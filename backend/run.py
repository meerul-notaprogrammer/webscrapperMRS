"""
Startup script that sets Windows event loop policy BEFORE uvicorn starts
This fixes Playwright subprocess issues on Windows
"""
import sys
import os

# CRITICAL: Set event loop policy BEFORE any asyncio imports
if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    print("✅ Windows event loop policy set to WindowsSelectorEventLoopPolicy")

# Now start uvicorn
import uvicorn
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    print(f"🚀 Starting server on {host}:{port}")
    print("⚠️  Reload disabled to maintain Windows event loop policy")
    print("   (Restart manually after code changes)")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,  # Disabled: reload creates subprocess that loses event loop policy
        log_level="info"
    )
