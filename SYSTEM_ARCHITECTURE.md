# ePerolehan Tender Scraper - System Architecture Report

## Executive Summary
A production-grade web scraping and tender management system for Malaysian government procurement portal (ePerolehan). Built with modern technologies focusing on reliability, user experience, and maintainability.

---

## 1. Technology Stack

### 1.1 Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI Library - Component-based architecture |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Vite** | 6.3.5 | Build tool - Fast HMR and optimized builds |
| **TailwindCSS** | 4.1.12 | Utility-first CSS framework |
| **TanStack Query** | 5.x | Server state management, caching, auto-refresh |
| **TanStack Router** | 1.x | Type-safe file-based routing |
| **Radix UI** | Latest | Accessible, unstyled UI primitives |
| **Sonner** | 2.x | Toast notifications |
| **Recharts** | 2.x | Data visualization |
| **Lucide React** | Latest | Icon library |

### 1.2 Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Primary backend language |
| **FastAPI** | 0.100+ | Modern async web framework |
| **Playwright** | 1.40+ | Browser automation for scraping |
| **BeautifulSoup4** | 4.12+ | HTML parsing |
| **APScheduler** | 3.10+ | Job scheduling (8am, 2pm, 8pm) |
| **Supabase** | 2.x | PostgreSQL database + Auth |
| **Loguru** | 0.7+ | Structured logging |
| **Uvicorn** | 0.25+ | ASGI server |

### 1.3 Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy, static file serving |
| **Ubuntu VPS** | Production hosting |
| **GitHub** | Version control, CI/CD source |

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                │
│                         http://192.168.1.110                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          NGINX (Port 80)                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐   │
│  │  Static Files (/)           │  │  API Proxy (/api/*)             │   │
│  │  React SPA from /dist       │  │  → http://api:8000/api/*        │   │
│  └─────────────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────────┐
│     API Container (8000)      │   │     Scheduler Container           │
│  ┌─────────────────────────┐  │   │  ┌─────────────────────────────┐  │
│  │      FastAPI App        │  │   │  │    APScheduler             │  │
│  │  - /api/tenders         │  │   │  │  - 8:00 AM MYT             │  │
│  │  - /api/stats           │  │   │  │  - 2:00 PM MYT             │  │
│  │  - /api/scrape          │  │   │  │  - 8:00 PM MYT             │  │
│  │  - /api/categories      │  │   │  └─────────────────────────────┘  │
│  └─────────────────────────┘  │   │                │                  │
│           │                   │   │                ▼                  │
│           ▼                   │   │  ┌─────────────────────────────┐  │
│  ┌─────────────────────────┐  │   │  │    Playwright Scraper      │  │
│  │  Playwright Scraper     │  │   │  │  - Headless Chromium       │  │
│  │  (for manual scrape)    │  │   │  │  - Pagination handling     │  │
│  └─────────────────────────┘  │   │  │  - Detail page extraction  │  │
└───────────────────────────────┘   │  └─────────────────────────────┘  │
                │                   └───────────────────────────────────┘
                │                                   │
                └───────────────┬───────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (Cloud)                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     PostgreSQL Database                          │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────────┐│    │
│  │  │  tenders  │ │ documents │ │ activity  │ │   scrape_logs     ││    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────────────┘│    │
│  │  ┌───────────┐ ┌───────────┐                                     │    │
│  │  │categories │ │ settings  │                                     │    │
│  │  └───────────┘ └───────────┘                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │
┌─────────────────────────────────────────────────────────────────────────┐
│                    ePerolehan.gov.my (Target)                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  /quotation-tender-notice                                        │    │
│  │  - List view with pagination (17+ pages)                         │    │
│  │  - Detail pages with full tender info                            │    │
│  │  - Document download links                                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow

### 3.1 Scraping Flow
```
1. Scheduler triggers at 8am/2pm/8pm MYT
   ↓
2. Playwright launches headless Chromium
   ↓
3. Navigate to ePerolehan tender list page
   ↓
4. For each page (1 to N):
   ├─ Parse table rows
   ├─ Extract: title, PTJ, dates, tender link
   ├─ For each tender with detail link:
   │   ├─ Navigate to detail page
   │   ├─ Extract: amount, description, contacts, documents
   │   └─ Return to list
   └─ Click "Next" if available
   ↓
5. For each scraped tender:
   ├─ Check if exists in DB (by quotation_number)
   ├─ If new: INSERT with status='available'
   └─ If exists: UPDATE (preserve status if not 'available')
   ↓
6. Log scrape result to scrape_logs table
```

### 3.2 Frontend Data Flow (TanStack Query)
```
User opens page
   ↓
useQuery('tenders') triggered
   ↓
Check cache → if fresh, return cached data
   ↓
If stale/missing → fetch from /api/tenders
   ↓
Transform API response to UI format
   ↓
Render TenderCards
   ↓
User clicks "Accept" on tender
   ↓
useMutation('updateTender') triggered
   ↓
Optimistic Update: UI updates immediately
   ↓
API call: PATCH /api/tenders/{id}
   ↓
On success: invalidate queries (stats, tenders)
On error: rollback optimistic update, show toast
```

---

## 4. API Design

### 4.1 Endpoints

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/api/tenders` | List all tenders | `?status=available&limit=100` | `{success, count, tenders[]}` |
| GET | `/api/tenders/{id}` | Get single tender | - | `{success, tender}` |
| PATCH | `/api/tenders/{id}` | Update tender | `{status, notes}` | `{success, tender}` |
| GET | `/api/stats` | Get statistics | - | `{success, stats}` |
| POST | `/api/scrape` | Trigger manual scrape | - | `{success, message}` |
| GET | `/api/scrape/status` | Get scrape status | - | `{is_running, last_scrape}` |
| GET | `/api/categories` | List categories | - | `{success, categories[]}` |
| PATCH | `/api/categories/{code}` | Toggle category | `{enabled}` | `{success}` |
| GET | `/api/documents/{tender_id}` | Get tender documents | - | `{success, documents[]}` |

### 4.2 Response Format
```typescript
// Standard API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tender Object
interface Tender {
  id: string;
  quotation_number: string;
  summary: string;
  description: string;
  amount: number;                    // RM value
  category_code: string;
  category_name: string;
  ministry_name: string;
  ministry_department: string;
  ministry_contact: string;
  ministry_phone: string;
  ministry_email: string;
  ministry_location: string;
  date_published: string;
  date_closing: string;
  date_briefing: string | null;
  days_remaining: number;
  is_urgent: boolean;
  tempoh_sah_laku: string;
  tender_link: string;
  tags: string[];
  status: 'available' | 'accepted' | 'onhold' | 'removed';
  notes: string | null;
  scraped_at: string;
  updated_at: string;
  documents: Document[];
}

// Document Object
interface Document {
  id: string;
  tender_id: string;
  name: string;
  url: string;
  size: string | null;
}
```

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram
```
┌─────────────────┐       ┌─────────────────────┐
│    tenders      │───┬───│  tender_documents   │
├─────────────────┤   │   ├─────────────────────┤
│ id (PK)         │   │   │ id (PK)             │
│ quotation_number│   │   │ tender_id (FK)      │
│ summary         │   │   │ name                │
│ description     │   │   │ url                 │
│ amount          │   │   │ size                │
│ category_code   │   │   └─────────────────────┘
│ ministry_*      │   │
│ date_*          │   │   ┌─────────────────────┐
│ status          │───┴───│  tender_activity    │
│ tags[]          │       ├─────────────────────┤
│ ...             │       │ id (PK)             │
└─────────────────┘       │ tender_id (FK)      │
                          │ action              │
┌─────────────────┐       │ user_name           │
│   categories    │       │ timestamp           │
├─────────────────┤       └─────────────────────┘
│ code (PK)       │
│ name            │       ┌─────────────────────┐
│ enabled         │       │    scrape_logs      │
│ keywords[]      │       ├─────────────────────┤
└─────────────────┘       │ id (PK)             │
                          │ scrape_time         │
                          │ tenders_found       │
                          │ new_tenders         │
                          │ updated_tenders     │
                          │ errors              │
                          │ duration_seconds    │
                          │ status              │
                          └─────────────────────┘
```

---

## 6. Frontend Architecture

### 6.1 Component Hierarchy
```
App.tsx
├── QueryProvider (TanStack Query)
│   └── ThemeProvider
│       ├── Header
│       │   ├── Logo
│       │   ├── ScrapeButton
│       │   ├── ThemeToggle
│       │   └── UserMenu
│       │
│       ├── MainContent
│       │   ├── StatisticsCards (4 cards)
│       │   ├── SearchFilterBar
│       │   │   ├── SearchInput
│       │   │   └── CategoryFilter (working dropdown)
│       │   │
│       │   ├── TenderTabs
│       │   │   ├── Available
│       │   │   ├── Accepted
│       │   │   ├── On Hold
│       │   │   └── Removed
│       │   │
│       │   └── TenderList
│       │       └── TenderCard (for each tender)
│       │           ├── Title
│       │           ├── Ministry
│       │           ├── Amount (RM XX,XXX.XX)
│       │           ├── ClosingDate
│       │           ├── Tags
│       │           └── ActionButtons
│       │
│       └── TenderDetailSidebar
│           ├── FullDescription
│           ├── ContactInfo
│           ├── DocumentList (with download links)
│           └── ActivityHistory
│
├── ScrapeProgressDialog (Modal)
│   ├── ProgressBar
│   ├── StatusText ("Scraping page 3 of 17...")
│   └── CancelButton
│
└── Toaster (Notifications)
```

### 6.2 TanStack Query Hooks
```typescript
// src/app/hooks/useTenders.ts
export const useTenders = (filters?: TenderFilters) => {
  return useQuery({
    queryKey: ['tenders', filters],
    queryFn: () => api.getTenders(filters),
    staleTime: 60 * 1000,           // 1 minute
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 mins
    select: (data) => data.tenders.map(transformApiTender),
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    staleTime: 60 * 1000,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// src/app/hooks/useMutations.ts
export const useUpdateTenderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }) => api.updateTender(id, { status }),
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries(['tenders']);
      const previous = queryClient.getQueryData(['tenders']);
      queryClient.setQueryData(['tenders'], (old) =>
        old.map(t => t.id === id ? { ...t, status } : t)
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      // Rollback
      queryClient.setQueryData(['tenders'], context.previous);
      toast.error('Failed to update tender');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tenders']);
      queryClient.invalidateQueries(['stats']);
    },
  });
};

export const useTriggerScrape = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.triggerScrape,
    onSuccess: () => {
      toast.success('Scraping started!');
    },
    onSettled: () => {
      // Refetch after scrape completes
      setTimeout(() => {
        queryClient.invalidateQueries(['tenders']);
        queryClient.invalidateQueries(['stats']);
      }, 30000);
    },
  });
};
```

---

## 7. Scraper Algorithm

### 7.1 Enhanced Scraping Logic
```python
async def scrape_all_tenders(self):
    """
    Full scraping algorithm with pagination and detail extraction
    """
    all_tenders = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 ...',
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()
        
        # Navigate to tender list
        await page.goto(self.tender_url)
        await page.wait_for_load_state('networkidle')
        
        current_page = 1
        max_pages = 50  # Safety limit
        
        while current_page <= max_pages:
            logger.info(f"📄 Scraping page {current_page}...")
            
            # Parse current page
            content = await page.content()
            page_tenders = self._parse_list_page(content)
            
            # For each tender, get details
            for tender in page_tenders:
                if tender.get('tender_link'):
                    detail = await self._scrape_detail_page(page, tender['tender_link'])
                    tender.update(detail)
                all_tenders.append(tender)
            
            # Check for next page
            next_button = await page.query_selector('a:has-text(">")')
            if next_button and await next_button.is_visible():
                await next_button.click()
                await page.wait_for_load_state('networkidle')
                current_page += 1
            else:
                break
        
        await browser.close()
    
    return all_tenders

async def _scrape_detail_page(self, page, url):
    """
    Extract detailed information from tender detail page
    """
    await page.goto(url)
    await page.wait_for_selector('.tender-detail', timeout=10000)
    
    content = await page.content()
    soup = BeautifulSoup(content, 'lxml')
    
    detail = {
        'description': self._extract_text(soup, 'Tajuk Perolehan'),
        'amount': self._extract_amount(soup, 'Jumlah Harga Indikatif'),
        'ministry_department': self._extract_text(soup, 'PTJ'),
        'ministry_contact': self._extract_contact(soup),
        'documents': self._extract_documents(soup),
    }
    
    await page.go_back()
    await page.wait_for_load_state('networkidle')
    
    return detail

def _extract_amount(self, soup, label):
    """
    Extract RM amount from page
    Returns float or 0.0
    """
    row = soup.find('td', string=re.compile(label))
    if row and row.find_next_sibling('td'):
        amount_text = row.find_next_sibling('td').get_text(strip=True)
        # Parse "671,800.00" → 671800.00
        amount = re.sub(r'[^\d.]', '', amount_text)
        return float(amount) if amount else 0.0
    return 0.0

def _extract_documents(self, soup):
    """
    Extract document links from SENARAI DOKUMEN section
    """
    documents = []
    doc_section = soup.find('div', id='SENARAI DOKUMEN') or soup.find('h4', string='SENARAI DOKUMEN')
    
    if doc_section:
        doc_table = doc_section.find_next('table')
        if doc_table:
            for row in doc_table.find_all('tr')[1:]:  # Skip header
                cols = row.find_all('td')
                if len(cols) >= 2:
                    name = cols[0].get_text(strip=True)
                    link = cols[1].find('a')
                    url = link.get('href', '') if link else ''
                    
                    if url and not url.startswith('http'):
                        url = self.base_url + url
                    
                    documents.append({
                        'name': name,
                        'url': url,
                        'size': None
                    })
    
    return documents
```

---

## 8. Security Considerations

1. **Rate Limiting**: Scraper includes delays between requests to avoid IP blocking
2. **User Agent Rotation**: Uses realistic browser user agents
3. **CORS**: FastAPI configured for production domains only
4. **Environment Variables**: All secrets in `.env` (not in code)
5. **RLS**: Supabase Row Level Security enabled
6. **HTTPS**: Should be configured on production nginx

---

## 9. Performance Optimizations

### Frontend
- **TanStack Query caching**: Reduces API calls
- **Optimistic updates**: Instant UI feedback
- **Code splitting**: Vite handles automatic chunking
- **Image lazy loading**: For any tender attachments

### Backend
- **Connection pooling**: Supabase handles this
- **Async I/O**: FastAPI + asyncio for non-blocking
- **Headless browser reuse**: Single browser instance per scrape
- **Batch inserts**: Where possible

---

## 10. Deployment Checklist

- [ ] VPS has Docker installed
- [ ] `.env` file configured with Supabase credentials
- [ ] Supabase tables created with schema
- [ ] Frontend built with `npm run build`
- [ ] Docker images built with `docker compose build`
- [ ] Services started with `docker compose up -d`
- [ ] Nginx serving on port 80
- [ ] Firewall allows port 80
- [ ] Initial scrape triggered successfully
- [ ] Scheduler running (check with `docker compose logs scheduler`)

---

## 11. Future Enhancements

1. **Email/Telegram Notifications** - Alert when new urgent tenders arrive
2. **PDF Export** - Export tender list to PDF
3. **Tender Analytics Dashboard** - Charts showing trends over time
4. **Multi-user Support** - User accounts with saved preferences
5. **AI Summarization** - Use LLM to summarize tender requirements
6. **Mobile App** - React Native version

---

*Document Version: 1.0*
*Last Updated: 2026-01-08*
*Author: ePerolehan Scraper Development Team*
