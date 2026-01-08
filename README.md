# 🚀 ePerolehan Web Scraper

Automated tender monitoring system for Malaysia's ePerolehan portal. Scrapes 30 government tender categories 3 times daily (8am, 2pm, 8pm) with intelligent auto-tagging and status management.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![React](https://img.shields.io/badge/react-18.3-blue)
![FastAPI](https://img.shields.io/badge/fastapi-0.115-green)

---

## ✨ Features

### 🤖 Automated Scraping
- ✅ **3x Daily Auto-Scraping** at 8 AM, 2 PM, 8 PM (Malaysia Time)
- ✅ **Manual Scraping** - Click button anytime to force immediate scrape
- ✅ **Background Processing** - Runs without interrupting your work
- ✅ **Scrape History Logging** - Track when scrapes happened and results

### 🎯 Smart Filtering
- ✅ **30 Category Codes Monitored** - Only scrapes your specific categories
- ✅ **Auto-Tagging** - Intelligent keyword-based categorization
- ✅ **Search & Filter** - Find tenders by quotation, ministry, tags, categories
- ✅ **Urgent Alerts** - Red flag for tenders closing in < 7 days

### 📊 Tender Management
- ✅ **Status Organization** - Available, Accepted, On Hold, Removed
- ✅ **One-Click Actions** - Quick status changes
- ✅ **Activity Logging** - Track all changes and actions
- ✅ **Detailed View** - Full tender information with documents

### 📈 Analytics & Reporting
- ✅ **Dashboard Statistics** - Real-time tender counts and trends
- ✅ **Scrape History** - Monitor scraper performance
- ✅ **Category Management** - Enable/disable specific categories

### 🎨 Modern UI
- ✅ **Figma-Based Design** - Premium, professional interface
- ✅ **Dark/Light Theme** - Toggle between themes
- ✅ **Responsive** - Works on desktop, tablet, mobile
- ✅ **Fast & Smooth** - Optimized performance

---

## 🏗️ Tech Stack

### Backend
- **Python 3.10+** - Core language
- **FastAPI** - REST API framework
- **Playwright** - Browser automation for scraping
- **Supabase** - Cloud PostgreSQL database
- **APScheduler** - Cron job scheduling

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS 4** - Styling
- **Radix UI** - Component library

### Deployment
- **Ubuntu VPS** - Server hosting
- **Nginx** - Reverse proxy
- **Systemd** - Service management

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account (free tier works)
- VPS with Ubuntu 22.04 (for production)

### Local Development (Windows)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd autojobscrapper
   ```

2. **Run setup script:**
   ```bash
   setup-local.bat
   ```

3. **Configure Supabase:**
   - Create a Supabase project at https://supabase.com
   - Run `backend/supabase_schema.sql` in Supabase SQL Editor
   - Get your Project URL and anon key from Settings → API
   - Edit `backend/.env` and add your credentials

4. **Start development servers:**
   ```bash
   start-dev.bat
   ```

5. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Production Deployment (VPS)

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

**Quick version:**
```bash
# Upload to VPS
scp -r autojobscrapper user@your-vps:/tmp/

# SSH into VPS
ssh user@your-vps

# Run deployment
cd /tmp/autojobscrapper
chmod +x deploy.sh
sudo ./deploy.sh

# Configure .env
sudo nano /opt/eperolehan-scraper/backend/.env
# Add your Supabase credentials

# Restart services
sudo systemctl restart eperolehan-api eperolehan-scheduler
```

---

## 📁 Project Structure

```
autojobscrapper/
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── scraper.py               # Playwright web scraper
│   ├── database.py              # Supabase client
│   ├── scheduler_service.py     # Cron scheduler
│   ├── requirements.txt         # Python dependencies
│   ├── supabase_schema.sql      # Database schema
│   └── .env                     # Environment config
│
├── src/
│   ├── app/
│   │   ├── App.tsx              # Main application
│   │   ├── components/          # React components
│   │   │   ├── TenderCard.tsx
│   │   │   ├── SearchFilterBar.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── ui/              # Radix UI components
│   │   └── data/
│   │       └── mockTenders.ts   # TypeScript interfaces
│   └── services/
│       └── api.ts               # API client
│
├── deploy.sh                    # VPS deployment script
├── setup-local.bat              # Windows local setup
├── start-dev.bat                # Start dev servers
├── DEPLOYMENT.md                # Deployment guide
└── README.md                    # This file
```

---

## ⚙️ Configuration

### Environment Variables

**Backend (`backend/.env`):**
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key

# Scraping
SCRAPE_SCHEDULE=0 8,14,20 * * *
TIMEZONE=Asia/Kuala_Lumpur
CATEGORY_CODES=010302,020301,020302,...

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:8000
```

### Monitored Categories

30 categories are monitored by default:
- 010302 - Penerbitan dan Penyiaran
- 020301 - Perabot Pejabat
- 020302 - Perabot Elektronik
- 020401 - Peralatan Domestik
- 020601 - Bekalan Pejabat
- 120401 - Alat Keselamatan
- 120501-120503 - Pengesanan dan Pemantauan
- 130201 - Perkhidmatan Pembersihan
- 140301-140502 - Perkhidmatan Penyelenggaraan & IT
- 210101-210109 - Peralatan Komputer
- 210201-210203 - Perisian
- 220402 - Peralatan Telekomunikasi
- 221110 - Peralatan Audio Visual
- 221502-221511 - Peralatan Fotografi & Video

---

## 📊 API Documentation

### Endpoints

**Tenders:**
- `GET /api/tenders` - Get all tenders
- `GET /api/tenders/{quotation_number}` - Get specific tender
- `PATCH /api/tenders/{quotation_number}` - Update tender

**Statistics:**
- `GET /api/stats` - Get tender statistics

**Scraping:**
- `POST /api/scrape` - Trigger manual scrape
- `GET /api/scrape/status` - Get scrape status
- `GET /api/scrape/history` - Get scrape history

**Categories:**
- `GET /api/categories` - Get all categories
- `PATCH /api/categories/{code}` - Toggle category

**Search:**
- `GET /api/search?q={query}` - Search tenders

Full API docs: http://localhost:8000/docs (when running)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate.bat  # Windows

python main.py
# Check error messages
```

### Scraper not working
1. Check if Playwright browser is installed:
   ```bash
   playwright install chromium
   ```
2. Verify ePerolehan URL is accessible
3. Check scraper logs

### Frontend not connecting to API
1. Verify backend is running on port 8000
2. Check `.env` has correct `VITE_API_URL`
3. Check browser console for CORS errors

### Database connection issues
1. Verify Supabase credentials in `backend/.env`
2. Check if schema is created in Supabase
3. Test connection:
   ```bash
   python -c "from database import db; print('OK')"
   ```

---

## 📈 Performance

- **Scrape Duration:** 5-15 minutes per run (depends on tender count)
- **Daily Scrapes:** 3x (8am, 2pm, 8pm Malaysia time)
- **Database Size:** ~50 MB per 1000 tenders
- **API Response Time:** < 100ms for most endpoints

---

## 🔒 Security

- ✅ Environment variables for secrets
- ✅ Supabase Row Level Security (RLS)
- ✅ CORS configuration
- ✅ Rate limiting ready
- ✅ SSL/HTTPS support (production)

---

## 📝 License

This project is private and proprietary.

---

## 🤝 Contributing

This is a private project. Contact the owner for access.

---

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md)
2. Review logs: `sudo journalctl -u eperolehan-api -f`
3. Contact project maintainer

---

## 🎯 Roadmap

- [x] Core scraping functionality
- [x] Automated scheduling
- [x] Status management
- [x] Search & filter
- [x] Analytics dashboard
- [x] VPS deployment
- [ ] Email notifications
- [ ] WhatsApp alerts
- [ ] AI-powered tender matching
- [ ] Bid tracking
- [ ] Multi-user support

---

**Built with ❤️ for efficient tender monitoring**

**Target Completion:** 2026-01-07 17:30 ✅