"""
ePerolehan Web Scraper v2.0 - Production Grade
Scrapes tender data from https://www.eperolehan.gov.my/quotation-tender-notice

Features:
- Full pagination support (scrapes all pages)
- Detail page extraction (amount, description, contacts, documents)
- Rate limiting to avoid IP blocks
- Robust error handling
- Progress tracking
"""
import os
import json
import re
import asyncio
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime
from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from bs4 import BeautifulSoup
from loguru import logger
from dotenv import load_dotenv

load_dotenv()


class ScrapeProgress:
    """Track scraping progress for real-time updates"""
    def __init__(self):
        self.current_page = 0
        self.total_pages = 0
        self.tenders_found = 0
        self.current_tender = ""
        self.status = "idle"  # idle, scraping_list, scraping_detail, complete, error
        self.error = None
    
    def to_dict(self):
        return {
            "current_page": self.current_page,
            "total_pages": self.total_pages,
            "tenders_found": self.tenders_found,
            "current_tender": self.current_tender,
            "status": self.status,
            "error": self.error
        }


class EPerolehanScraper:
    def __init__(self):
        self.base_url = "https://www.eperolehan.gov.my"
        self.tender_url = f"{self.base_url}/quotation-tender-notice"
        self.headless = os.getenv("HEADLESS_BROWSER", "true").lower() == "true"
        self.timeout = int(os.getenv("PAGE_TIMEOUT", "60000"))
        self.delay_between_pages = float(os.getenv("SCRAPE_DELAY", "2.0"))  # seconds
        self.max_pages = int(os.getenv("MAX_PAGES", "50"))  # safety limit
        self.scrape_details = os.getenv("SCRAPE_DETAILS", "true").lower() == "true"
        
        # Progress tracking
        self.progress = ScrapeProgress()
        
        # Parse TAG_KEYWORDS with error handling
        try:
            tag_keywords_str = os.getenv("TAG_KEYWORDS", "{}")
            self.tag_keywords = json.loads(tag_keywords_str)
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️ TAG_KEYWORDS JSON parse error: {e}. Using empty dict.")
            self.tag_keywords = {}
        
        logger.info(f"🔧 Scraper v2.0 initialized | Headless: {self.headless} | Max Pages: {self.max_pages}")
    
    async def scrape_all_categories(self, progress_callback: Optional[Callable] = None) -> List[Dict[str, Any]]:
        """
        Scrape all tenders from ePerolehan with full pagination and detail extraction
        
        Args:
            progress_callback: Optional async function to call with progress updates
        
        Returns:
            List of tender dictionaries
        """
        all_tenders = []
        self.progress = ScrapeProgress()
        self.progress.status = "scraping_list"
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.headless,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080}
            )
            
            page = await context.new_page()
            
            try:
                logger.info(f"🔍 Navigating to {self.tender_url}")
                await page.goto(self.tender_url, timeout=self.timeout)
                await page.wait_for_load_state("networkidle")
                
                # Wait for tender table to load
                await page.wait_for_selector("table", timeout=15000)
                
                # Get total pages from pagination
                self.progress.total_pages = await self._get_total_pages(page)
                logger.info(f"📊 Total pages detected: {self.progress.total_pages}")
                
                current_page = 1
                
                while current_page <= min(self.progress.total_pages, self.max_pages):
                    self.progress.current_page = current_page
                    self.progress.status = "scraping_list"
                    
                    if progress_callback:
                        await progress_callback(self.progress.to_dict())
                    
                    logger.info(f"📄 Scraping page {current_page}/{self.progress.total_pages}...")
                    
                    # Get page content
                    content = await page.content()
                    page_tenders = self._parse_tender_list(content)
                    
                    logger.info(f"   Found {len(page_tenders)} tenders on page {current_page}")
                    
                    # Optionally scrape detail pages
                    if self.scrape_details:
                        for i, tender in enumerate(page_tenders):
                            if tender.get('tender_link') and tender['tender_link'] != '#':
                                self.progress.status = "scraping_detail"
                                self.progress.current_tender = tender.get('quotation_number', f'Tender {i+1}')
                                
                                if progress_callback:
                                    await progress_callback(self.progress.to_dict())
                                
                                try:
                                    detail = await self._scrape_detail_page(page, tender['tender_link'])
                                    tender.update(detail)
                                except Exception as e:
                                    logger.warning(f"⚠️ Could not scrape detail for {tender.get('quotation_number')}: {e}")
                    
                    all_tenders.extend(page_tenders)
                    self.progress.tenders_found = len(all_tenders)
                    
                    # Navigate to next page
                    if current_page < min(self.progress.total_pages, self.max_pages):
                        next_clicked = await self._go_to_next_page(page)
                        if not next_clicked:
                            logger.info("   No more pages available")
                            break
                        
                        # Rate limiting
                        await asyncio.sleep(self.delay_between_pages)
                    
                    current_page += 1
                
                self.progress.status = "complete"
                
            except Exception as e:
                logger.error(f"❌ Error scraping tenders: {e}")
                self.progress.status = "error"
                self.progress.error = str(e)
                
            finally:
                await browser.close()
        
        if progress_callback:
            await progress_callback(self.progress.to_dict())
        
        logger.info(f"🎯 Total tenders scraped: {len(all_tenders)}")
        return all_tenders
    
    async def _get_total_pages(self, page: Page) -> int:
        """Extract total pages from pagination element"""
        try:
            # Look for pagination text like "Mukasurat 1 / 17"
            pagination_text = await page.text_content('.pagination-info, .page-info, [class*="pagination"]')
            if pagination_text:
                match = re.search(r'(\d+)\s*/\s*(\d+)', pagination_text)
                if match:
                    return int(match.group(2))
            
            # Alternative: count page buttons
            page_buttons = await page.query_selector_all('.pagination a, .page-numbers a')
            if page_buttons:
                # Get the last numbered button
                last_page = 1
                for btn in page_buttons:
                    text = await btn.text_content()
                    if text and text.strip().isdigit():
                        last_page = max(last_page, int(text.strip()))
                return last_page
            
            return 1
        except:
            return 1
    
    async def _go_to_next_page(self, page: Page) -> bool:
        """Click next page button, return True if successful"""
        try:
            # Try common next button selectors
            selectors = [
                'a:has-text(">")',
                'a:has-text("Next")',
                '.pagination .next a',
                'a[rel="next"]',
                '.page-item:last-child a'
            ]
            
            for selector in selectors:
                next_btn = await page.query_selector(selector)
                if next_btn and await next_btn.is_visible():
                    await next_btn.click()
                    await page.wait_for_load_state("networkidle")
                    return True
            
            return False
        except Exception as e:
            logger.warning(f"⚠️ Could not navigate to next page: {e}")
            return False
    
    async def _scrape_detail_page(self, page: Page, url: str) -> Dict[str, Any]:
        """
        Navigate to detail page and extract comprehensive information
        
        Returns dict with: description, amount, contacts, documents, field_codes, location
        """
        detail = {
            'description': None,
            'amount': 0.0,
            'ministry_department': None,
            'ministry_contact': None,
            'ministry_phone': None,
            'ministry_email': None,
            'ministry_location': None,
            'documents': [],
            'field_codes': [],
            'contact_details': []
        }
        
        try:
            # Store current URL to go back
            current_url = page.url
            
            await page.goto(url, timeout=self.timeout)
            await page.wait_for_load_state("networkidle")
            
            content = await page.content()
            soup = BeautifulSoup(content, 'lxml')
            
            # Extract amount (Jumlah Harga Indikatif)
            amount_str = self._extract_labeled_value(soup, 
                ['Jumlah Harga Indikatif', 'Harga Indikatif', 'Anggaran Harga'])
            if amount_str:
                # Clean amount string (remove RM, commas)
                clean_amount = re.sub(r'[^\d.]', '', amount_str)
                try:
                    detail['amount'] = float(clean_amount)
                except:
                    detail['amount'] = 0.0
            
            # Extract description
            detail['description'] = self._extract_labeled_value(soup, 
                ['Tajuk Perolehan', 'Perihal', 'Keterangan'])
            
            # Extract ministry details
            detail['ministry_department'] = self._extract_labeled_value(soup, ['PTJ', 'Bahagian'])
            
            # Extract Location (Lokaliti Liputan) - Optional
            detail['ministry_location'] = self._extract_labeled_value(soup, 
                ['Lokaliti Liputan', 'Lokasi Liputan', 'Lokasi'])
            
            # Extract Field Codes (Kod Bidang) - Take ALL
            detail['field_codes'] = self._extract_field_codes(soup)
            
            # Extract contact info from PEGAWAI UNTUK DIHUBUNGI section - Take ALL
            contacts = self._extract_contacts(soup)
            detail['contact_details'] = contacts
            
            # Set primary contact for backward compatibility
            if contacts:
                primary = contacts[0]
                detail['ministry_contact'] = primary.get('name')
                detail['ministry_phone'] = primary.get('phone')
                detail['ministry_email'] = primary.get('email')
            
            # Extract documents from SENARAI DOKUMEN section - Take ALL
            detail['documents'] = self._extract_documents(soup)
            
            # Go back to list
            await page.goto(current_url, timeout=self.timeout)
            await page.wait_for_load_state("networkidle")
            
        except Exception as e:
            logger.warning(f"⚠️ Error scraping detail page {url}: {e}")
        
        return detail
    
    def _extract_field_codes(self, soup: BeautifulSoup) -> List[str]:
        """Extract all Kod Bidang from the table"""
        codes = []
        
        # Find header for Kod Bidang
        header = soup.find(['h4', 'h5', 'div', 'strong'], string=re.compile('Kod Bidang', re.I))
        if header:
            # Find the table
            table = header.find_next('table')
            if table:
                rows = table.find_all('tr')
                # Skip header row (usually contains "Kod Bidang", "Bidang", etc.)
                for row in rows[1:]:
                    cells = row.find_all('td')
                    if cells and len(cells) > 0:
                        code = cells[0].get_text(strip=True)
                        desc = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                        if code:
                            codes.append(f"{code} - {desc}")
        
        return codes

    def _extract_contacts(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract all contacts from PEGAWAI UNTUK DIHUBUNGI section"""
        contacts = []
        
        # Find the contact section
        section_header = soup.find(['h4', 'h5', 'div'], string=re.compile('PEGAWAI UNTUK DIHUBUNGI', re.I))
        if not section_header:
            section_header = soup.find(['h4', 'h5', 'div'], string=re.compile('Contact', re.I))
        
        if section_header:
            # Find the table after the header
            table = section_header.find_next('table')
            if table:
                rows = table.find_all('tr')
                # Skip header row
                for row in rows[1:]:
                    cells = row.find_all('td')
                    if len(cells) >= 2: # At least name and phone
                        contact = {}
                        contact['name'] = cells[0].get_text(strip=True)
                        contact['phone'] = cells[1].get_text(strip=True)
                        
                        # Email usually in last column or 4th
                        if len(cells) > 2:
                             # Check for mailto link
                            email_link = row.find('a', href=re.compile('mailto:'))
                            if email_link:
                                contact['email'] = email_link.get_text(strip=True)
                            else:
                                # Try last column
                                contact['email'] = cells[-1].get_text(strip=True)
                        
                        contacts.append(contact)
        
        return contacts
    
    def _extract_documents(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract document links from SENARAI DOKUMEN section"""
        documents = []
        
        # Find document section
        doc_header = soup.find(['h4', 'h5', 'div'], string=re.compile('SENARAI DOKUMEN', re.I))
        if not doc_header:
            doc_header = soup.find(id=re.compile('dokumen', re.I))
        
        if doc_header:
            # Find the next table or list
            container = doc_header.find_next(['table', 'ul', 'div'])
            
            if container:
                # Handle table format
                if container.name == 'table':
                    for row in container.find_all('tr'):
                        cells = row.find_all('td')
                        if cells:
                            name = cells[0].get_text(strip=True)
                            link = row.find('a', href=True)
                            
                            if name and link:
                                url = link.get('href', '')
                                if url and not url.startswith('http'):
                                    url = self.base_url + url
                                
                                documents.append({
                                    'name': name,
                                    'url': url,
                                    'size': None
                                })
                
                # Handle list format
                elif container.name == 'ul':
                    for li in container.find_all('li'):
                        link = li.find('a', href=True)
                        if link:
                            url = link.get('href', '')
                            if url and not url.startswith('http'):
                                url = self.base_url + url
                            
                            documents.append({
                                'name': link.get_text(strip=True),
                                'url': url,
                                'size': None
                            })
        
        return documents
    
    def _parse_tender_list(self, html: str) -> List[Dict[str, Any]]:
        """Parse tender list from HTML table"""
        soup = BeautifulSoup(html, 'lxml')
        tenders = []
        
        table = soup.find('table')
        if not table:
            logger.warning("⚠️ No table found on page")
            return tenders
        
        rows = table.find_all('tr')[1:]  # Skip header row
        
        for idx, row in enumerate(rows):
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
                quotation_number = self._extract_quotation_number(tender_link, idx)
                
                tender = {
                    "quotation_number": quotation_number,
                    "summary": title,
                    "description": title,  # Will be updated from detail page
                    "amount": 0.0,  # Will be updated from detail page
                    "category_code": "",
                    "category_name": "",
                    "ministry_name": ptj,
                    "ministry_department": "",
                    "ministry_contact": "",
                    "ministry_phone": "",
                    "ministry_email": "",
                    "ministry_location": "",
                    "field_codes": [],
                    "contact_details": [],
                    "date_iklan": date_iklan.isoformat() if date_iklan else None,
                    "date_published": date_iklan.isoformat() if date_iklan else None,
                    "date_closing": date_tutup.isoformat() if date_tutup else None,
                    "date_briefing": None,
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
            # Try patterns like QT25000000012345
            match = re.search(r'(QT\d+)', link, re.I)
            if match:
                return match.group(1).upper()
            
            # Try to extract ID from URL query params
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
            date_str = date_str.strip()
            
            # Try common Malaysian date formats
            formats = [
                "%d/%m/%Y %I:%M %p",  # 07/01/2026 12:00 PM
                "%d/%m/%Y %H:%M",      # 07/01/2026 14:00
                "%d/%m/%Y",            # 07/01/2026
                "%d-%m-%Y %I:%M %p",
                "%d-%m-%Y %H:%M",
                "%d-%m-%Y",
                "%Y-%m-%d %H:%M:%S",
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
        
        # Default keywords if none configured
        default_keywords = {
            "IT": ["komputer", "laptop", "server", "perisian", "software", "hardware", "ict"],
            "Furniture": ["perabot", "meja", "kerusi", "almari", "kabinet"],
            "Security": ["keselamatan", "cctv", "pengawasan", "kawalan"],
            "Cleaning": ["pembersihan", "cucian", "cleaning"],
            "Maintenance": ["penyelenggaraan", "servis", "maintenance"],
            "Printing": ["cetakan", "printing", "percetakan", "penerbitan"],
            "Stationery": ["alat tulis", "stationery", "kertas", "pen"],
            "Electronics": ["elektronik", "elektrik", "electric"],
        }
        
        keywords = self.tag_keywords if self.tag_keywords else default_keywords
        
        for tag, keyword_list in keywords.items():
            if any(keyword.lower() in text_lower for keyword in keyword_list):
                tags.append(tag)
        
        return tags
    
    def get_progress(self) -> Dict[str, Any]:
        """Get current scraping progress"""
        return self.progress.to_dict()


# Singleton instance
scraper = EPerolehanScraper()
