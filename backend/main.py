"""
FastAPI Backend for ePerolehan Scraper
Provides REST API for frontend
"""
import os
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
from dotenv import load_dotenv

from database import db
from scraper import scraper
from scheduler_service import scheduler

load_dotenv()

# ==================== MODELS ====================

class TenderUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class CategoryToggle(BaseModel):
    enabled: bool

class ManualScrapeResponse(BaseModel):
    message: str
    status: str

# ==================== APP ====================

app = FastAPI(
    title="ePerolehan Scraper API",
    description="Backend API for ePerolehan tender monitoring system",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== STARTUP/SHUTDOWN ====================

@app.on_event("startup")
async def startup_event():
    """Start scheduler on app startup"""
    logger.info("🚀 Starting ePerolehan Scraper API...")
    scheduler.start()
    logger.info("✅ API ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop scheduler on app shutdown"""
    logger.info("👋 Shutting down...")
    scheduler.stop()

# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "running",
        "service": "ePerolehan Scraper API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/tenders")
async def get_tenders(
    status: Optional[str] = None,
    limit: int = 100
):
    """Get all tenders, optionally filtered by status"""
    try:
        tenders = await db.get_all_tenders(status=status, limit=limit)
        return {
            "success": True,
            "count": len(tenders),
            "tenders": tenders
        }
    except Exception as e:
        logger.error(f"❌ Error fetching tenders: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tenders/{quotation_number}")
async def get_tender(quotation_number: str):
    """Get a specific tender by quotation number"""
    try:
        tender = await db.get_tender_by_quotation(quotation_number)
        
        if not tender:
            raise HTTPException(status_code=404, detail="Tender not found")
        
        # Get documents and activity
        documents = await db.get_tender_documents(tender["id"])
        activity = await db.get_tender_activity(tender["id"])
        
        return {
            "success": True,
            "tender": tender,
            "documents": documents,
            "activity": activity
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching tender: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/tenders/{quotation_number}")
async def update_tender(
    quotation_number: str,
    update: TenderUpdate
):
    """Update tender status or notes"""
    try:
        tender = await db.get_tender_by_quotation(quotation_number)
        
        if not tender:
            raise HTTPException(status_code=404, detail="Tender not found")
        
        update_data = {}
        if update.status:
            update_data["status"] = update.status
        if update.notes is not None:
            update_data["notes"] = update.notes
        
        updated = await db.update_tender(quotation_number, update_data)
        
        # Log activity
        if update.status:
            await db.insert_activity(
                tender["id"],
                f"Status changed to {update.status}",
                "User"
            )
        
        return {
            "success": True,
            "tender": updated
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating tender: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_statistics():
    """Get tender statistics"""
    try:
        stats = await db.get_tender_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        logger.error(f"❌ Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scrape")
async def manual_scrape(background_tasks: BackgroundTasks):
    """Manually trigger a scrape"""
    try:
        if scheduler.is_running:
            return {
                "success": False,
                "message": "Scrape already in progress",
                "status": "running"
            }
        
        # Run scrape in background
        background_tasks.add_task(scheduler.run_manual_scrape)
        
        return {
            "success": True,
            "message": "Scrape started successfully",
            "status": "started"
        }
    except Exception as e:
        logger.error(f"❌ Error starting scrape: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scrape/status")
async def scrape_status():
    """Get current scrape status"""
    try:
        recent_scrapes = await db.get_recent_scrapes(limit=1)
        
        return {
            "success": True,
            "is_running": scheduler.is_running,
            "last_scrape": recent_scrapes[0] if recent_scrapes else None
        }
    except Exception as e:
        logger.error(f"❌ Error fetching scrape status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scrape/history")
async def scrape_history(limit: int = 10):
    """Get scrape history"""
    try:
        history = await db.get_recent_scrapes(limit=limit)
        return {
            "success": True,
            "count": len(history),
            "history": history
        }
    except Exception as e:
        logger.error(f"❌ Error fetching scrape history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/categories")
async def get_categories():
    """Get all categories"""
    try:
        categories = await db.get_all_categories()
        return {
            "success": True,
            "count": len(categories),
            "categories": categories
        }
    except Exception as e:
        logger.error(f"❌ Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/categories/{code}")
async def toggle_category(code: str, toggle: CategoryToggle):
    """Enable/disable a category"""
    try:
        success = await db.toggle_category(code, toggle.enabled)
        
        if not success:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {
            "success": True,
            "message": f"Category {code} {'enabled' if toggle.enabled else 'disabled'}"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error toggling category: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search")
async def search_tenders(
    q: str,
    categories: Optional[str] = None
):
    """Search tenders"""
    try:
        category_list = categories.split(",") if categories else None
        results = await db.search_tenders(q, category_list)
        
        return {
            "success": True,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        logger.error(f"❌ Error searching tenders: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== RUN ====================

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
