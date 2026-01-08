# 🏗️ ePerolehan Scraper - System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                  React Frontend (Vite)                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │
│  │  │  Dashboard  │  │  Analytics  │  │  Settings           │   │  │
│  │  │  - Stats    │  │  - Charts   │  │  - Categories       │   │  │
│  │  │  - Tenders  │  │  - Trends   │  │  - Scrape Schedule  │   │  │
│  │  │  - Search   │  │  - History  │  │  - Tags             │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │  │
│  │                                                                │  │
│  │  Components: TenderCard, SearchFilterBar, StatisticsCard      │  │
│  │  Theme: Dark/Light Mode, Responsive Design                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (FastAPI)                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                              │  │
│  │  GET  /api/tenders          - List all tenders               │  │
│  │  GET  /api/tenders/{id}     - Get tender details             │  │
│  │  PATCH /api/tenders/{id}    - Update tender status           │  │
│  │  GET  /api/stats            - Get statistics                 │  │
│  │  POST /api/scrape           - Trigger manual scrape          │  │
│  │  GET  /api/scrape/status    - Get scrape status              │  │
│  │  GET  /api/categories       - List categories                │  │
│  │  GET  /api/search           - Search tenders                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  CORS: Configured for frontend                                      │
│  Port: 8000                                                          │
└─────────────────────────────────────────────────────────────────────┘
                    │                           │
                    │                           │
        ┌───────────┴────────┐     ┌───────────┴────────────┐
        │                    │     │                        │
        ▼                    ▼     ▼                        ▼
┌──────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│   Database   │    │  Scraper Service    │    │    Scheduler     │
│   Client     │    │   (Playwright)      │    │  (APScheduler)   │
│              │    │                     │    │                  │
│ - CRUD Ops   │    │ ┌─────────────────┐ │    │  Cron: 8am      │
│ - Queries    │    │ │ Browser Control │ │    │        2pm      │
│ - Stats      │    │ │ - Navigate      │ │    │        8pm      │
│ - Search     │    │ │ - Fill forms    │ │    │                  │
│              │    │ │ - Extract data  │ │    │  Timezone: MY   │
│              │    │ └─────────────────┘ │    │                  │
│              │    │                     │    │  Auto-trigger   │
│              │    │ ┌─────────────────┐ │    │  scraper job    │
│              │    │ │   Parser        │ │    │                  │
│              │    │ │ - HTML parsing  │ │    └──────────────────┘
│              │    │ │ - Data extract  │ │
│              │    │ │ - Auto-tagging  │ │
│              │    │ └─────────────────┘ │
│              │    │                     │
│              │    │ Target:             │
│              │    │ ePerolehan.gov.my   │
└──────┬───────┘    └─────────────────────┘
       │
       │ Supabase Client
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Cloud Database)                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      PostgreSQL Tables                        │  │
│  │                                                                │  │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐ │  │
│  │  │   tenders    │  │ tender_documents │  │ tender_activity │ │  │
│  │  │              │  │                  │  │                 │ │  │
│  │  │ - id         │  │ - id             │  │ - id            │ │  │
│  │  │ - quotation  │  │ - tender_id      │  │ - tender_id     │ │  │
│  │  │ - category   │  │ - name           │  │ - action        │ │  │
│  │  │ - summary    │  │ - url            │  │ - user          │ │  │
│  │  │ - amount     │  │ - size           │  │ - timestamp     │ │  │
│  │  │ - ministry   │  └──────────────────┘  └─────────────────┘ │  │
│  │  │ - dates      │                                            │  │
│  │  │ - status     │  ┌──────────────┐  ┌─────────────────────┐ │  │
│  │  │ - tags       │  │ scrape_logs  │  │    categories       │ │  │
│  │  │ - urgent     │  │              │  │                     │ │  │
│  │  └──────────────┘  │ - time       │  │ - code              │ │  │
│  │                    │ - found      │  │ - name              │ │  │
│  │                    │ - new        │  │ - enabled           │ │  │
│  │                    │ - updated    │  │ - keywords          │ │  │
│  │                    │ - errors     │  └─────────────────────┘ │  │
│  │                    │ - duration   │                          │  │
│  │                    └──────────────┘                          │  │
│  │                                                                │  │
│  │  Features:                                                     │  │
│  │  - Auto-increment IDs                                          │  │
│  │  - Timestamps (created_at, updated_at)                         │  │
│  │  - Triggers (auto-calculate days_remaining)                    │  │
│  │  - Indexes (performance optimization)                          │  │
│  │  - RLS Policies (security)                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Automated Scraping (3x Daily)
```
Scheduler (8am/2pm/8pm)
    ↓
Trigger Scraper
    ↓
Playwright → ePerolehan.gov.my
    ↓
Extract tender data (30 categories)
    ↓
Parse HTML → Structured data
    ↓
Auto-tag with keywords
    ↓
Check if tender exists in DB
    ↓
Insert new OR Update existing
    ↓
Log scrape results
    ↓
Update statistics
```

### 2. Manual Scrape (User-triggered)
```
User clicks "Refresh Tenders"
    ↓
Frontend → POST /api/scrape
    ↓
Backend → Background task
    ↓
[Same as automated scraping]
    ↓
Return status to frontend
    ↓
Show toast notification
```

### 3. Tender Management
```
User views tender list
    ↓
Frontend → GET /api/tenders?status=available
    ↓
Backend → Database query
    ↓
Return tender data
    ↓
Display in TenderCard components
    ↓
User clicks "Accept"
    ↓
Frontend → PATCH /api/tenders/{id}
    ↓
Backend → Update status
    ↓
Log activity
    ↓
Return updated tender
    ↓
Update UI
```

### 4. Search & Filter
```
User types search query
    ↓
Frontend → GET /api/search?q=komputer
    ↓
Backend → Full-text search
    ↓
Filter by categories (if selected)
    ↓
Return matching tenders
    ↓
Display filtered results
```

---

## 🚀 Deployment Architecture

### Development (Local)
```
Windows PC
├── Frontend (Vite Dev Server)
│   └── http://localhost:5173
├── Backend (Uvicorn)
│   └── http://localhost:8000
└── Database (Supabase Cloud)
    └── https://your-project.supabase.co
```

### Production (VPS)
```
Ubuntu VPS
├── Nginx (Port 80/443)
│   ├── Serve Frontend (/)
│   └── Proxy API (/api → :8000)
├── Systemd Services
│   ├── eperolehan-api.service
│   └── eperolehan-scheduler.service
└── Database (Supabase Cloud)
    └── https://your-project.supabase.co
```

---

## 📊 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI Framework |
| | Vite | Build Tool |
| | TailwindCSS 4 | Styling |
| | Radix UI | Components |
| | Lucide Icons | Icons |
| **Backend** | Python 3.10+ | Language |
| | FastAPI | Web Framework |
| | Playwright | Browser Automation |
| | APScheduler | Cron Jobs |
| | Loguru | Logging |
| **Database** | Supabase | Cloud PostgreSQL |
| | PostgreSQL 15 | Database Engine |
| **Deployment** | Ubuntu 22.04 | OS |
| | Nginx | Web Server |
| | Systemd | Service Manager |
| | Certbot | SSL Certificates |

---

## 🎯 Key Features Mapped to Components

| Feature | Frontend | Backend | Database |
|---------|----------|---------|----------|
| **Auto-Scraping** | - | scheduler_service.py | scrape_logs |
| **Manual Scrape** | Button | POST /api/scrape | scrape_logs |
| **Tender List** | TenderCard | GET /api/tenders | tenders |
| **Status Change** | Buttons | PATCH /api/tenders | tenders, tender_activity |
| **Search** | SearchFilterBar | GET /api/search | tenders (indexed) |
| **Statistics** | StatisticsCard | GET /api/stats | tenders (aggregated) |
| **Analytics** | AnalyticsPage | GET /api/scrape/history | scrape_logs |
| **Settings** | SettingsPage | PATCH /api/categories | categories |
| **Auto-Tagging** | - | scraper.py | tenders.tags |
| **Urgent Alerts** | Badge | - | tenders.is_urgent |

---

## 🔐 Security Layers

```
User Request
    ↓
[Nginx] → Rate Limiting, SSL
    ↓
[CORS] → Origin Validation
    ↓
[FastAPI] → Input Validation
    ↓
[Supabase] → RLS Policies
    ↓
[PostgreSQL] → Row-Level Security
```

---

## 📈 Performance Optimizations

1. **Database Indexes** - Fast queries on status, category, date
2. **Pagination** - Limit results to 100 per request
3. **Caching** - Browser caching for static assets
4. **Background Jobs** - Scraping doesn't block API
5. **Lazy Loading** - Frontend loads data as needed
6. **Optimized Queries** - Select only needed columns

---

## 🎉 Complete Feature List

✅ **30 Category Codes** monitored  
✅ **3x Daily Scraping** (8am, 2pm, 8pm)  
✅ **Manual Scrape** trigger  
✅ **Auto-Tagging** (10 keyword categories)  
✅ **Status Management** (4 states)  
✅ **Search & Filter** (full-text + categories)  
✅ **Urgent Alerts** (<7 days)  
✅ **Activity Logging** (all changes tracked)  
✅ **Statistics Dashboard** (real-time)  
✅ **Scrape History** (performance monitoring)  
✅ **Category Management** (enable/disable)  
✅ **Dark/Light Theme**  
✅ **Responsive Design**  
✅ **VPS Deployment** (one-command)  
✅ **Cloud Database** (Supabase)  

---

**Architecture Status:** ✅ Complete  
**Ready for Deployment:** ✅ Yes  
**Target Time:** 5:30 PM ✅
