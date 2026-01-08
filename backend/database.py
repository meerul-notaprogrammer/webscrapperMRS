"""
Database connection and operations for Supabase
"""
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
from loguru import logger

load_dotenv()

class SupabaseDB:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        
        self.client: Client = create_client(url, key)
        logger.info("✅ Connected to Supabase")
    
    # ==================== TENDERS ====================
    
    async def insert_tender(self, tender_data: Dict[str, Any]) -> Optional[Dict]:
        """Insert a new tender"""
        try:
            response = self.client.table("tenders").insert(tender_data).execute()
            logger.info(f"✅ Inserted tender: {tender_data.get('quotation_number')}")
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"❌ Error inserting tender: {e}")
            return None
    
    async def update_tender(self, quotation_number: str, update_data: Dict[str, Any]) -> Optional[Dict]:
        """Update an existing tender"""
        try:
            update_data['updated_at'] = datetime.now().isoformat()
            response = self.client.table("tenders").update(update_data).eq("quotation_number", quotation_number).execute()
            logger.info(f"✅ Updated tender: {quotation_number}")
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"❌ Error updating tender: {e}")
            return None
    
    async def get_tender_by_quotation(self, quotation_number: str) -> Optional[Dict]:
        """Get tender by quotation number"""
        try:
            response = self.client.table("tenders").select("*").eq("quotation_number", quotation_number).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"❌ Error fetching tender: {e}")
            return None
    
    async def get_all_tenders(self, status: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Get all tenders, optionally filtered by status"""
        try:
            query = self.client.table("tenders").select("*")
            
            if status:
                query = query.eq("status", status)
            
            response = query.order("date_closing", desc=False).limit(limit).execute()
            return response.data
        except Exception as e:
            logger.error(f"❌ Error fetching tenders: {e}")
            return []
    
    async def update_tender_status(self, tender_id: str, new_status: str, user: str = "System") -> bool:
        """Update tender status and log activity"""
        try:
            # Update status
            await self.update_tender(tender_id, {"status": new_status})
            
            # Log activity
            await self.insert_activity(tender_id, f"Status changed to {new_status}", user)
            
            return True
        except Exception as e:
            logger.error(f"❌ Error updating status: {e}")
            return False
    
    async def search_tenders(self, query: str, categories: List[str] = None) -> List[Dict]:
        """Search tenders by query and categories"""
        try:
            # Basic search implementation
            response = self.client.table("tenders").select("*").ilike("summary", f"%{query}%").execute()
            
            tenders = response.data
            
            # Filter by categories if provided
            if categories:
                tenders = [t for t in tenders if t.get("category_code") in categories]
            
            return tenders
        except Exception as e:
            logger.error(f"❌ Error searching tenders: {e}")
            return []
    
    # ==================== DOCUMENTS ====================
    
    async def insert_documents(self, tender_id: str, documents: List[Dict]) -> bool:
        """Insert tender documents"""
        try:
            docs_data = [{"tender_id": tender_id, **doc} for doc in documents]
            self.client.table("tender_documents").insert(docs_data).execute()
            logger.info(f"✅ Inserted {len(documents)} documents for tender {tender_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Error inserting documents: {e}")
            return False
    
    async def get_tender_documents(self, tender_id: str) -> List[Dict]:
        """Get all documents for a tender"""
        try:
            response = self.client.table("tender_documents").select("*").eq("tender_id", tender_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"❌ Error fetching documents: {e}")
            return []
    
    # ==================== ACTIVITY ====================
    
    async def insert_activity(self, tender_id: str, action: str, user: str = "System") -> bool:
        """Log tender activity"""
        try:
            activity_data = {
                "tender_id": tender_id,
                "action": action,
                "user_name": user,
                "timestamp": datetime.now().isoformat()
            }
            self.client.table("tender_activity").insert(activity_data).execute()
            return True
        except Exception as e:
            logger.error(f"❌ Error logging activity: {e}")
            return False
    
    async def get_tender_activity(self, tender_id: str) -> List[Dict]:
        """Get activity history for a tender"""
        try:
            response = self.client.table("tender_activity").select("*").eq("tender_id", tender_id).order("timestamp", desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"❌ Error fetching activity: {e}")
            return []
    
    # ==================== SCRAPE LOGS ====================
    
    async def insert_scrape_log(self, log_data: Dict[str, Any]) -> bool:
        """Insert scrape log"""
        try:
            self.client.table("scrape_logs").insert(log_data).execute()
            logger.info(f"✅ Logged scrape: {log_data.get('status')}")
            return True
        except Exception as e:
            logger.error(f"❌ Error logging scrape: {e}")
            return False
    
    async def get_recent_scrapes(self, limit: int = 10) -> List[Dict]:
        """Get recent scrape logs"""
        try:
            response = self.client.table("scrape_logs").select("*").order("scrape_time", desc=True).limit(limit).execute()
            return response.data
        except Exception as e:
            logger.error(f"❌ Error fetching scrape logs: {e}")
            return []
    
    # ==================== CATEGORIES ====================
    
    async def get_enabled_categories(self) -> List[Dict]:
        """Get all enabled categories"""
        try:
            response = self.client.table("categories").select("*").eq("enabled", True).execute()
            return response.data
        except Exception as e:
            logger.error(f"❌ Error fetching categories: {e}")
            return []
    
    async def toggle_category(self, code: str, enabled: bool) -> bool:
        """Enable/disable a category"""
        try:
            self.client.table("categories").update({"enabled": enabled}).eq("code", code).execute()
            logger.info(f"✅ Category {code} {'enabled' if enabled else 'disabled'}")
            return True
        except Exception as e:
            logger.error(f"❌ Error toggling category: {e}")
            return False
    
    # ==================== STATISTICS ====================
    
    async def get_tender_stats(self) -> Dict[str, int]:
        """Get tender statistics"""
        try:
            all_tenders = await self.get_all_tenders(limit=1000)
            
            stats = {
                "total": len(all_tenders),
                "available": len([t for t in all_tenders if t["status"] == "available"]),
                "accepted": len([t for t in all_tenders if t["status"] == "accepted"]),
                "onhold": len([t for t in all_tenders if t["status"] == "onhold"]),
                "removed": len([t for t in all_tenders if t["status"] == "removed"]),
                "urgent": len([t for t in all_tenders if t.get("is_urgent", False) and t["status"] == "available"])
            }
            
            return stats
        except Exception as e:
            logger.error(f"❌ Error calculating stats: {e}")
            return {}

# Singleton instance
db = SupabaseDB()
