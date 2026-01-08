"""
Scheduler for automatic scraping at 8am, 2pm, 8pm Malaysia time
"""
import os
import asyncio
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from pytz import timezone
from loguru import logger
from dotenv import load_dotenv

from scraper import scraper
from database import db

load_dotenv()

class ScraperScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.tz = timezone(os.getenv("TIMEZONE", "Asia/Kuala_Lumpur"))
        self.is_running = False
        
    async def run_scrape_job(self):
        """Execute scraping job"""
        if self.is_running:
            logger.warning("⚠️ Scrape already in progress, skipping...")
            return
        
        self.is_running = True
        start_time = datetime.now()
        logger.info("🚀 Starting scheduled scrape...")
        
        try:
            # Scrape all tenders
            tenders = await scraper.scrape_all_categories()
            
            new_count = 0
            updated_count = 0
            errors = []
            
            # Process each tender
            for tender_data in tenders:
                try:
                    quotation_number = tender_data.get("quotation_number")
                    
                    # Check if tender exists
                    existing = await db.get_tender_by_quotation(quotation_number)
                    
                    if existing:
                        # Update existing tender
                        await db.update_tender(quotation_number, tender_data)
                        updated_count += 1
                    else:
                        # Insert new tender
                        new_tender = await db.insert_tender(tender_data)
                        
                        if new_tender:
                            # Log activity
                            await db.insert_activity(
                                new_tender["id"],
                                "Scraped by system",
                                "System"
                            )
                            new_count += 1
                    
                except Exception as e:
                    error_msg = f"Error processing {tender_data.get('quotation_number', 'unknown')}: {str(e)}"
                    errors.append(error_msg)
                    logger.error(f"❌ {error_msg}")
            
            # Calculate duration
            duration = (datetime.now() - start_time).seconds
            
            # Log scrape result
            log_data = {
                "scrape_time": start_time.isoformat(),
                "tenders_found": len(tenders),
                "new_tenders": new_count,
                "updated_tenders": updated_count,
                "errors": "\n".join(errors) if errors else None,
                "duration_seconds": duration,
                "status": "success" if not errors else "partial" if new_count > 0 else "failed"
            }
            
            await db.insert_scrape_log(log_data)
            
            logger.info(f"✅ Scrape completed: {new_count} new, {updated_count} updated, {len(errors)} errors ({duration}s)")
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            logger.error(f"❌ Scrape job failed: {e}")
            logger.error(f"Full traceback:\n{error_trace}")
            
            # Log failure
            await db.insert_scrape_log({
                "scrape_time": start_time.isoformat(),
                "tenders_found": 0,
                "new_tenders": 0,
                "updated_tenders": 0,
                "errors": f"{str(e)}\n\n{error_trace}",
                "duration_seconds": (datetime.now() - start_time).seconds,
                "status": "failed"
            })
        
        finally:
            self.is_running = False
    
    def start(self):
        """Start the scheduler"""
        # Schedule for 8am, 2pm, 8pm Malaysia time
        trigger = CronTrigger(
            hour="8,14,20",
            minute="0",
            timezone=self.tz
        )
        
        self.scheduler.add_job(
            self.run_scrape_job,
            trigger=trigger,
            id="eperolehan_scraper",
            name="ePerolehan Scraper Job",
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("⏰ Scheduler started: Scraping at 8am, 2pm, 8pm Malaysia time")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("⏹️ Scheduler stopped")
    
    async def run_manual_scrape(self):
        """Manually trigger a scrape"""
        logger.info("🔧 Manual scrape triggered")
        await self.run_scrape_job()

# Singleton instance
scheduler = ScraperScheduler()

# For running standalone
if __name__ == "__main__":
    logger.info("🚀 Starting ePerolehan Scraper Scheduler...")
    
    try:
        scheduler.start()
        
        # Keep running
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        logger.info("👋 Shutting down scheduler...")
        scheduler.stop()
