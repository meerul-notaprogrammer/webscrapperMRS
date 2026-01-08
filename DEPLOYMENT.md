# ePerolehan Web Scraper - Complete Deployment Guide

## 🚀 Quick Start (5 Steps)

### Step 1: Setup Supabase Database (5 min)

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to **SQL Editor** → **New Query**
3. Copy the entire contents of `backend/supabase_schema.sql`
4. Paste and run it in Supabase SQL Editor
5. Get your credentials:
   - Go to **Settings** → **API**
   - Copy **Project URL** and **anon public** key

### Step 2: Configure Backend (2 min)

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key_here
   ```

### Step 3: Deploy to VPS (10 min)

1. **Upload project to VPS:**
   ```bash
   # On your local machine
   scp -r autojobscrapper user@your-vps-ip:/tmp/
   ```

2. **SSH into VPS:**
   ```bash
   ssh user@your-vps-ip
   ```

3. **Run deployment script:**
   ```bash
   cd /tmp/autojobscrapper
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

4. **Edit .env with your credentials:**
   ```bash
   sudo nano /opt/eperolehan-scraper/backend/.env
   # Add your SUPABASE_URL and SUPABASE_KEY
   # Save: Ctrl+X, Y, Enter
   ```

5. **Restart services:**
   ```bash
   sudo systemctl restart eperolehan-api
   sudo systemctl restart eperolehan-scheduler
   ```

### Step 4: Configure Domain (Optional, 5 min)

1. **Update Nginx config:**
   ```bash
   sudo nano /etc/nginx/sites-available/eperolehan
   # Change "your-domain.com" to your actual domain
   ```

2. **Restart Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

3. **Setup SSL (Optional):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Step 5: Verify Deployment (2 min)

1. **Check services:**
   ```bash
   sudo systemctl status eperolehan-api
   sudo systemctl status eperolehan-scheduler
   ```

2. **Check logs:**
   ```bash
   sudo journalctl -u eperolehan-api -f
   sudo journalctl -u eperolehan-scheduler -f
   ```

3. **Test API:**
   ```bash
   curl http://localhost:8000/
   curl http://localhost:8000/api/stats
   ```

4. **Access frontend:**
   - Open browser: `http://your-vps-ip`
   - Or: `http://your-domain.com`

---

## 📋 Project Structure

```
autojobscrapper/
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── scraper.py               # Playwright scraper
│   ├── database.py              # Supabase client
│   ├── scheduler_service.py     # Cron scheduler
│   ├── requirements.txt         # Python dependencies
│   ├── supabase_schema.sql      # Database schema
│   └── .env                     # Environment config
├── src/
│   ├── app/
│   │   ├── App.tsx              # Main app
│   │   ├── components/          # UI components
│   │   └── data/                # Mock data (will be replaced)
│   └── services/
│       └── api.ts               # API service
├── deploy.sh                    # VPS deployment script
└── README.md                    # This file
```

---

## ⚙️ Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Supabase (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key

# Scraping Schedule (8am, 2pm, 8pm Malaysia time)
SCRAPE_SCHEDULE=0 8,14,20 * * *
TIMEZONE=Asia/Kuala_Lumpur

# Category Codes (30 categories monitored)
CATEGORY_CODES=010302,020301,020302,020401,020601,120401,120501,120502,120503,130201,140301,140302,140501,140502,210101,210102,210103,210104,210105,210106,210107,210108,210109,210201,210202,210203,220402,221110,221502,221511

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://your-domain.com
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://your-vps-ip:8000
# Or for production:
# VITE_API_URL=https://your-domain.com
```

---

## 🔧 Manual Setup (Alternative to deploy.sh)

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browser
playwright install chromium

# Configure .env
cp .env.example .env
nano .env  # Add your Supabase credentials

# Run API
uvicorn main:app --host 0.0.0.0 --port 8000

# Run scheduler (in another terminal)
python scheduler_service.py
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Serve production build
npx serve dist
```

---

## 📊 API Endpoints

### Tenders
- `GET /api/tenders` - Get all tenders
- `GET /api/tenders/{quotation_number}` - Get specific tender
- `PATCH /api/tenders/{quotation_number}` - Update tender status/notes

### Statistics
- `GET /api/stats` - Get tender statistics

### Scraping
- `POST /api/scrape` - Trigger manual scrape
- `GET /api/scrape/status` - Get scrape status
- `GET /api/scrape/history` - Get scrape history

### Categories
- `GET /api/categories` - Get all categories
- `PATCH /api/categories/{code}` - Enable/disable category

### Search
- `GET /api/search?q={query}&categories={codes}` - Search tenders

---

## 🐛 Troubleshooting

### Services not starting

```bash
# Check logs
sudo journalctl -u eperolehan-api -n 50
sudo journalctl -u eperolehan-scheduler -n 50

# Restart services
sudo systemctl restart eperolehan-api
sudo systemctl restart eperolehan-scheduler
```

### Scraper not working

1. Check if Playwright browser is installed:
   ```bash
   cd /opt/eperolehan-scraper/backend
   source venv/bin/activate
   playwright install chromium
   ```

2. Check scraper logs:
   ```bash
   tail -f /opt/eperolehan-scraper/backend/logs/scraper.log
   ```

### Frontend not loading

1. Check Nginx config:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

2. Check if frontend is built:
   ```bash
   ls -la /opt/eperolehan-scraper/dist
   ```

### Database connection issues

1. Verify Supabase credentials in `.env`
2. Check if schema is created in Supabase SQL Editor
3. Test connection:
   ```bash
   cd /opt/eperolehan-scraper/backend
   source venv/bin/activate
   python -c "from database import db; print('Connected!')"
   ```

---

## 🔒 Security Checklist

- [ ] Change default Nginx server_name
- [ ] Setup SSL with Certbot
- [ ] Configure firewall (UFW):
  ```bash
  sudo ufw allow 22    # SSH
  sudo ufw allow 80    # HTTP
  sudo ufw allow 443   # HTTPS
  sudo ufw enable
  ```
- [ ] Secure Supabase RLS policies
- [ ] Use environment variables for secrets
- [ ] Regular backups of Supabase database

---

## 📈 Monitoring

### Check Service Status
```bash
sudo systemctl status eperolehan-api
sudo systemctl status eperolehan-scheduler
```

### View Logs
```bash
# API logs
sudo journalctl -u eperolehan-api -f

# Scheduler logs
sudo journalctl -u eperolehan-scheduler -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Stats
```bash
curl http://localhost:8000/api/stats
```

---

## 🚀 Production Checklist

- [ ] Supabase database schema created
- [ ] Backend `.env` configured with Supabase credentials
- [ ] Frontend built (`npm run build`)
- [ ] Services running (`systemctl status`)
- [ ] Nginx configured and running
- [ ] Domain pointed to VPS IP
- [ ] SSL certificate installed (optional)
- [ ] Firewall configured
- [ ] First scrape completed successfully
- [ ] Frontend accessible via browser

---

## 📞 Support

If you encounter issues:

1. Check logs first
2. Verify all environment variables
3. Ensure Supabase schema is created
4. Test API endpoints manually
5. Check service status

---

## 🎯 Features Implemented

✅ Automated scraping 3x daily (8am, 2pm, 8pm)
✅ Manual scrape trigger
✅ 30 category codes monitored
✅ Auto-tagging with keywords
✅ Tender status management (Available, Accepted, On Hold, Removed)
✅ Search and filter
✅ Statistics dashboard
✅ Activity logging
✅ Scrape history
✅ Responsive UI (Figma design)
✅ Dark/Light theme
✅ Real-time updates
✅ Supabase cloud database
✅ VPS deployment ready

---

**Deployment Time:** ~30 minutes total
**Target:** Production-ready by 5:30 PM ✅
