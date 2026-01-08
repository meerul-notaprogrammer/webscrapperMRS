"""
ePerolehan Web Scraper using Playwright
Scrapes tender data from https://www.eperolehan.gov.my/quotation-tender-notice
"""
import os
import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

class EPerolehanScraper:
    def __init__(self):
        self.base_url = "https://www.eperolehan.gov.my"
        self.tender_url = f"{self.base_url}/quotation-tender-notice"
        self.headless = os.getenv("HEADLESS_BROWSER", "true").lower() == "true"
        self.timeout = int(os.getenv("PAGE_TIMEOUT", "60000"))
        
        # Parse TAG_KEYWORDS with error handling
        try:
            tag_keywords_str = os.getenv("TAG_KEYWORDS", "{}")
            self.tag_keywords = json.loads(tag_keywords_str)
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️ TAG_KEYWORDS JSON parse error: {e}. Using empty dict.")
            self.tag_keywords = {}
        
        logger.info(f"🔧 Scraper initialized for {self.tender_url}")
    
    async def scrape_all_categories(self) -> List[Dict[str, Any]]:
        """Scrape all tenders from ePerolehan quotation-tender-notice page"""
        all_tenders = []
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            page = await browser.new_page()
            
            try:
                logger.info(f"🔍 Navigating to {self.tender_url}")
                await page.goto(self.tender_url, timeout=self.timeout)
                await page.wait_for_load_state("networkidle")
                
                # Wait for tender table to load
                await page.wait_for_selector("table", timeout=10000)
                
                # Get page content
                content = await page.content()
                tenders = self._parse_tender_list(content)
                
                logger.info(f"✅ Found {len(tenders)} tenders")
                all_tenders.extend(tenders)
                
                # TODO: Handle pagination if exists
                # TODO: Click each tender for detailed info
                
            except Exception as e:
                logger.error(f"❌ Error scraping tenders: {e}")
            finally:
                await browser.close()
        
        logger.info(f"🎯 Total tenders scraped: {len(all_tenders)}")
        return all_tenders
    
    def _parse_tender_list(self, html: str) -> List[Dict[str, Any]]:
        """Parse tender list from HTML"""
        soup = BeautifulSoup(html, 'lxml')
        tenders = []
        
        # Find all tender rows in the table
        # Based on your screenshot, the table has columns:
        # Tajuk Perolehan | PTJ | Tarikh Iklan | Tarikh Tutup | Tempoh Sah Laku | Tindakan
        
        table = soup.find('table')
        if not table:
            logger.warning("⚠️ No table found on page")
            return tenders
        
        rows = table.find_all('tr')[1:]  # Skip header row
        
        for row in rows:
            try:
                cols = row.find_all('td')
                if len(cols) < 5:
                    continue
                
                # Extract data from columns
                title_elem = cols[0]
                ptj = cols[1].get_text(strip=True)
                tarikh_iklan = cols[2].get_text(strip=True)
                tarikh_tutup = cols[3].get_text(strip=True)
                tempoh_sah_laku = cols[4].get_text(strip=True) if len(cols) > 4 else ""
                
                # Get tender title and link
                title_link = title_elem.find('a')
                if title_link:
                    title = title_link.get_text(strip=True)
                    tender_link = title_link.get('href', '')
                    if tender_link and not tender_link.startswith('http'):
                        tender_link = self.base_url + tender_link
                else:
                    title = title_elem.get_text(strip=True)
                    tender_link = ""
                
                # Parse dates
                date_iklan = self._parse_date(tarikh_iklan)
                date_tutup = self._parse_date(tarikh_tutup)
                
                # Calculate days remaining
                if date_tutup:
                    days_remaining = (date_tutup - datetime.now()).days
                    is_urgent = days_remaining < 7
                else:
                    days_remaining = 0
                    is_urgent = False
                
                # Auto-tag
                tags = self._auto_tag(title)
                
                # Generate quotation number from link or use index
                quotation_number = self._extract_quotation_number(tender_link, len(tenders))
                
                tender = {
                    "quotation_number": quotation_number,
                    "summary": title,
                    "ministry_name": ptj,
                    "date_iklan": date_iklan.isoformat() if date_iklan else None,
                    "date_closing": date_tutup.isoformat() if date_tutup else None,
                    "days_remaining": days_remaining,
                    "is_urgent": is_urgent,
                    "tempoh_sah_laku": tempoh_sah_laku,
                    "tender_link": tender_link,
                    "tags": tags,
                    "status": "available",
                    "scraped_at": datetime.now().isoformat()
                }
                
                tenders.append(tender)
                
            except Exception as e:
                logger.warning(f"⚠️ Error parsing tender row: {e}")
                continue
        
        return tenders
    
    def _extract_quotation_number(self, link: str, index: int) -> str:
        """Extract quotation number from link or generate one"""
        if link:
            # Try to extract ID from URL
            match = re.search(r'[?&]id=([^&]+)', link)
            if match:
                return match.group(1)
            
            # Try to extract from path
            match = re.search(r'/([A-Z0-9]+)/?$', link)
            if match:
                return match.group(1)
        
        # Generate from timestamp and index
        return f"QT{datetime.now().strftime('%Y%m%d')}{index:04d}"
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime"""
        if not date_str or date_str.strip() == "":
            return None
            
        try:
            # Clean the date string
            date_str = date_str.strip()
            
            # Try common Malaysian date formats
            formats = [
                "%d/%m/%Y %I:%M %p",  # 07/01/2026 12:00 PM
                "%d/%m/%Y",            # 07/01/2026
                "%d-%m-%Y %I:%M %p",
                "%d-%m-%Y",
                "%Y-%m-%d",
                "%d %b %Y",
                "%d %B %Y"
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except:
                    continue
            
            logger.warning(f"⚠️ Could not parse date: {date_str}")
            return None
        except Exception as e:
            logger.error(f"❌ Date parsing error: {e}")
            return None
    
    def _auto_tag(self, text: str) -> List[str]:
        """Auto-tag tender based on keywords"""
        tags = []
        text_lower = text.lower()
        
        for tag, keywords in self.tag_keywords.items():
            if any(keyword.lower() in text_lower for keyword in keywords):
                tags.append(tag)
        
        return tags
    
    async def scrape_single_tender(self, quotation_number: str) -> Optional[Dict[str, Any]]:
        """Scrape a single tender by quotation number"""
        # This would need to be implemented based on the actual tender detail page structure
        logger.warning("⚠️ scrape_single_tender not yet implemented")
        return None

# Singleton instance
scraper = EPerolehanScraper()
