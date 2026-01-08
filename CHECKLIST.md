# ✅ ePerolehan Scraper - Complete Deployment Checklist

**Target:** Production deployment by 5:30 PM (2026-01-07)  
**Current Time:** 4:10 PM  
**Time Available:** 80 minutes  

---

## 📋 Pre-Deployment Checklist

### ☐ Supabase Setup (5 minutes)
- [ ] Go to https://supabase.com
- [ ] Create new project (wait for provisioning ~2 min)
- [ ] Copy Project URL from Settings → API
- [ ] Copy anon public key from Settings → API
- [ ] Open SQL Editor
- [ ] Copy entire `backend/supabase_schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify tables created (check Tables tab)

### ☐ Backend Configuration (2 minutes)
- [ ] Navigate to `backend/` folder
- [ ] Copy `.env.example` to `.env`
- [ ] Open `.env` in text editor
- [ ] Paste Supabase URL
- [ ] Paste Supabase anon key
- [ ] Save file
- [ ] Verify no syntax errors

### ☐ VPS Access (2 minutes)
- [ ] Confirm VPS IP address
- [ ] Test SSH connection: `ssh user@vps-ip`
- [ ] Verify Ubuntu version: `lsb_release -a`
- [ ] Check available disk space: `df -h`
- [ ] Check RAM: `free -h`
- [ ] Exit SSH

---

## 🚀 Deployment Steps (20 minutes)

### ☐ Step 1: Upload Project (3 minutes)
```bash
# From your local machine
cd c:\document\MRS\
scp -r autojobscrapper user@your-vps-ip:/tmp/
```
- [ ] Upload started
- [ ] Upload completed (check for errors)
- [ ] Verify file size matches

### ☐ Step 2: SSH into VPS (1 minute)
```bash
ssh user@your-vps-ip
```
- [ ] Connected successfully
- [ ] In correct directory

### ☐ Step 3: Run Deployment Script (10 minutes)
```bash
cd /tmp/autojobscrapper
chmod +x deploy.sh
sudo ./deploy.sh
```
- [ ] Script started
- [ ] System packages installing
- [ ] Python dependencies installing
- [ ] Playwright browser installing
- [ ] Frontend building
- [ ] Systemd services created
- [ ] Nginx configured
- [ ] Services started
- [ ] Script completed successfully

### ☐ Step 4: Configure Environment (2 minutes)
```bash
sudo nano /opt/eperolehan-scraper/backend/.env
```
- [ ] File opened
- [ ] Add `SUPABASE_URL=https://your-project.supabase.co`
- [ ] Add `SUPABASE_KEY=your_anon_key_here`
- [ ] Update `CORS_ORIGINS` with your domain (if applicable)
- [ ] Save file (Ctrl+X, Y, Enter)

### ☐ Step 5: Restart Services (2 minutes)
```bash
sudo systemctl restart eperolehan-api
sudo systemctl restart eperolehan-scheduler
sudo systemctl restart nginx
```
- [ ] API restarted
- [ ] Scheduler restarted
- [ ] Nginx restarted
- [ ] No errors shown

### ☐ Step 6: Update Nginx Domain (Optional, 2 minutes)
```bash
sudo nano /etc/nginx/sites-available/eperolehan
# Change "your-domain.com" to actual domain
sudo nginx -t
sudo systemctl restart nginx
```
- [ ] Domain updated (or skipped if using IP)
- [ ] Nginx config valid
- [ ] Nginx restarted

---

## 🔍 Verification Steps (10 minutes)

### ☐ Check Services Status
```bash
sudo systemctl status eperolehan-api
sudo systemctl status eperolehan-scheduler
```
- [ ] API service: **active (running)** ✅
- [ ] Scheduler service: **active (running)** ✅
- [ ] No errors in status output

### ☐ Check Logs
```bash
sudo journalctl -u eperolehan-api -n 20
sudo journalctl -u eperolehan-scheduler -n 20
```
- [ ] API logs show "✅ API ready!"
- [ ] Scheduler logs show "⏰ Scheduler started"
- [ ] No error messages
- [ ] Supabase connection successful

### ☐ Test API Endpoints
```bash
curl http://localhost:8000/
curl http://localhost:8000/api/stats
curl http://localhost:8000/api/categories
```
- [ ] Root endpoint returns JSON
- [ ] Stats endpoint returns statistics
- [ ] Categories endpoint returns 30 categories
- [ ] All responses have `"success": true`

### ☐ Test Frontend
```bash
# From your local browser
http://your-vps-ip
```
- [ ] Page loads successfully
- [ ] No console errors (F12)
- [ ] Dashboard displays
- [ ] Statistics cards show (may be 0 initially)
- [ ] "Refresh Tenders" button visible
- [ ] Theme toggle works
- [ ] Navigation works

---

## 🎯 First Scrape Test (10 minutes)

### ☐ Trigger Manual Scrape
- [ ] Click "Refresh Tenders" button
- [ ] Toast notification shows "Scraping in progress..."
- [ ] Wait 5-10 minutes (scraping takes time)

### ☐ Monitor Scrape Progress
```bash
# On VPS
sudo journalctl -u eperolehan-scheduler -f
```
- [ ] See "🚀 Starting scheduled scrape..."
- [ ] See "🔍 Scraping category: ..."
- [ ] See "✅ Found X tenders in ..."
- [ ] See "✅ Scrape completed: X new, Y updated"

### ☐ Verify Results
- [ ] Refresh frontend page
- [ ] Statistics updated
- [ ] Tenders appear in "Available" tab
- [ ] Can click on tender to view details
- [ ] Can change tender status
- [ ] Search works
- [ ] Filter works

---

## 🔒 Security Checklist (5 minutes)

### ☐ Firewall Configuration
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (if using SSL)
sudo ufw enable
sudo ufw status
```
- [ ] Firewall enabled
- [ ] Only necessary ports open

### ☐ SSL Certificate (Optional)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
- [ ] Certbot installed (or skipped)
- [ ] SSL certificate obtained (or skipped)
- [ ] HTTPS working (or skipped)

### ☐ Environment Security
- [ ] `.env` file has correct permissions (600)
- [ ] Supabase keys not exposed in frontend
- [ ] No sensitive data in logs
- [ ] RLS policies enabled in Supabase

---

## 📊 Performance Verification (5 minutes)

### ☐ Database Performance
- [ ] Login to Supabase dashboard
- [ ] Check Tables → tenders (should have data)
- [ ] Check Tables → scrape_logs (should have entries)
- [ ] Check Tables → categories (should have 30 rows)
- [ ] Queries execute quickly (<100ms)

### ☐ API Performance
```bash
time curl http://localhost:8000/api/stats
time curl http://localhost:8000/api/tenders
```
- [ ] Stats endpoint: < 200ms
- [ ] Tenders endpoint: < 500ms

### ☐ Frontend Performance
- [ ] Page load: < 2 seconds
- [ ] Interactions smooth
- [ ] No lag when filtering
- [ ] Search results instant

---

## 🐛 Troubleshooting Checklist

### ☐ If API Won't Start
```bash
cd /opt/eperolehan-scraper/backend
source venv/bin/activate
python main.py
# Read error message
```
- [ ] Check error message
- [ ] Verify `.env` file exists
- [ ] Verify Supabase credentials correct
- [ ] Check Python dependencies installed

### ☐ If Scraper Fails
```bash
cd /opt/eperolehan-scraper/backend
source venv/bin/activate
playwright install chromium
```
- [ ] Playwright browser installed
- [ ] Check scraper logs for errors
- [ ] Verify ePerolehan.gov.my is accessible
- [ ] Check network connectivity

### ☐ If Frontend Not Loading
```bash
sudo nginx -t
ls -la /opt/eperolehan-scraper/dist
sudo systemctl restart nginx
```
- [ ] Nginx config valid
- [ ] Frontend built (dist/ folder exists)
- [ ] Nginx restarted
- [ ] Check Nginx error logs

### ☐ If Database Connection Fails
- [ ] Verify Supabase URL in `.env`
- [ ] Verify Supabase key in `.env`
- [ ] Check Supabase project is active
- [ ] Test connection: `python -c "from database import db; print('OK')"`

---

## 📈 Post-Deployment Monitoring (Ongoing)

### ☐ Daily Checks
- [ ] Check service status: `sudo systemctl status eperolehan-*`
- [ ] Check logs for errors: `sudo journalctl -u eperolehan-api -n 50`
- [ ] Verify scrapes running (8am, 2pm, 8pm)
- [ ] Check Supabase dashboard for new data

### ☐ Weekly Checks
- [ ] Review scrape history in frontend
- [ ] Check disk space: `df -h`
- [ ] Review Supabase usage (free tier limits)
- [ ] Backup important data

### ☐ Monthly Checks
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Review and archive old tenders
- [ ] Check for Python/Node.js updates
- [ ] Review and optimize database queries

---

## ✅ Final Verification

### ☐ All Systems Go
- [ ] ✅ Supabase database created and schema loaded
- [ ] ✅ Backend API running on VPS
- [ ] ✅ Scheduler running on VPS
- [ ] ✅ Frontend accessible via browser
- [ ] ✅ First scrape completed successfully
- [ ] ✅ Data appearing in database
- [ ] ✅ All features working (search, filter, status change)
- [ ] ✅ No errors in logs
- [ ] ✅ Services set to auto-start on reboot
- [ ] ✅ Firewall configured

### ☐ Documentation Complete
- [ ] ✅ README.md reviewed
- [ ] ✅ DEPLOYMENT.md reviewed
- [ ] ✅ QUICK_START.md reviewed
- [ ] ✅ ARCHITECTURE.md reviewed
- [ ] ✅ Team trained on usage

---

## 🎉 Success Criteria

**Deployment is successful when:**

1. ✅ You can access `http://your-vps-ip` and see the dashboard
2. ✅ Statistics show real numbers (not 0)
3. ✅ Tenders appear in the "Available" tab
4. ✅ You can click "Refresh Tenders" and it works
5. ✅ You can change tender status (Available → Accepted)
6. ✅ Search and filter work correctly
7. ✅ Services restart automatically after VPS reboot
8. ✅ Scraper runs automatically at 8am, 2pm, 8pm

---

## 📞 Support Resources

**If you get stuck:**

1. Check logs: `sudo journalctl -u eperolehan-api -f`
2. Review DEPLOYMENT.md troubleshooting section
3. Verify all checklist items above
4. Check Supabase dashboard for database issues
5. Test API endpoints manually with curl

---

## ⏱️ Time Estimate

| Task | Estimated Time | Status |
|------|---------------|--------|
| Supabase Setup | 5 min | ☐ |
| Backend Config | 2 min | ☐ |
| Upload to VPS | 3 min | ☐ |
| Run Deployment | 10 min | ☐ |
| Configure .env | 2 min | ☐ |
| Restart Services | 2 min | ☐ |
| Verification | 10 min | ☐ |
| First Scrape | 10 min | ☐ |
| Security | 5 min | ☐ |
| **TOTAL** | **~50 min** | ☐ |

**Buffer:** 30 minutes for troubleshooting  
**Target Completion:** 5:30 PM ✅

---

**Ready to Deploy!** 🚀  
**Start Time:** ___:___  
**Target Time:** 5:30 PM  
**Status:** ☐ Not Started | ☐ In Progress | ☐ Complete
