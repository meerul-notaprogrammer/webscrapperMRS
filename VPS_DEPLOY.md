# VPS Deployment Guide - Quick Steps

## 📦 Step 1: Upload Project to VPS

From your Windows machine, run:

```powershell
# Compress the project (excluding node_modules and venv)
cd C:\document\MRS\
tar -czf autojobscrapper.tar.gz autojobscrapper --exclude=node_modules --exclude=venv --exclude=dist --exclude=.git

# Upload to VPS
scp autojobscrapper.tar.gz meerul@192.168.1.110:/tmp/
```

---

## 🔧 Step 2: SSH into VPS and Deploy

```bash
# SSH into VPS
ssh meerul@192.168.1.110

# Extract project
cd /tmp
tar -xzf autojobscrapper.tar.gz

# Run deployment script
cd autojobscrapper
chmod +x deploy.sh
sudo ./deploy.sh
```

---

## ⚙️ Step 3: Configure Environment

The deployment script will create `/opt/eperolehan-scraper/backend/.env` from the example.

**IMPORTANT:** Copy your working .env file:

```bash
# After deployment completes, copy your .env with Supabase credentials
sudo nano /opt/eperolehan-scraper/backend/.env
```

Or upload your working .env:
```powershell
# From Windows
scp backend\.env meerul@192.168.1.110:/tmp/backend.env

# Then on VPS
ssh meerul@192.168.1.110
sudo cp /tmp/backend.env /opt/eperolehan-scraper/backend/.env
sudo chown root:root /opt/eperolehan-scraper/backend/.env
sudo chmod 600 /opt/eperolehan-scraper/backend/.env
```

---

## 🔄 Step 4: Restart Services

```bash
sudo systemctl restart eperolehan-api
sudo systemctl restart eperolehan-scheduler
sudo systemctl restart nginx
```

---

## ✅ Step 5: Verify Deployment

```bash
# Check services
sudo systemctl status eperolehan-api
sudo systemctl status eperolehan-scheduler

# Check logs
sudo journalctl -u eperolehan-api -n 20
sudo journalctl -u eperolehan-scheduler -n 20

# Test API
curl http://localhost:8000/
curl http://localhost:8000/api/stats
```

---

## 🌐 Step 6: Access Frontend

Open browser: **http://192.168.1.110**

---

## 🐛 Troubleshooting

### If services fail to start:
```bash
# Check detailed logs
sudo journalctl -u eperolehan-api -f
```

### If frontend doesn't load:
```bash
# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### If scraper fails:
```bash
# Install Playwright dependencies
cd /opt/eperolehan-scraper/backend
source venv/bin/activate
playwright install-deps
playwright install chromium
```

---

**Ready to deploy!** Follow the steps above.
