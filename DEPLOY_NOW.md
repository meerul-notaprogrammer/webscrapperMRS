# 🚀 Deploy to Ubuntu VPS - Quick Commands

## From Your Windows Machine

### Step 1: Upload Project (2 min)
```powershell
# Navigate to project
cd C:\document\MRS\autojobscrapper

# Upload to VPS using SCP
scp -r backend src index.html package.json vite.config.ts postcss.config.mjs deploy.sh meerul@192.168.1.110:/tmp/autojobscrapper/
```

### Step 2: Upload Your Working .env (1 min)
```powershell
# Upload your .env with Supabase credentials
scp backend\.env meerul@192.168.1.110:/tmp/backend.env
```

---

## On Your Ubuntu VPS

### Step 3: SSH and Deploy (10 min)
```bash
# SSH into VPS
ssh meerul@192.168.1.110

# Navigate to uploaded project
cd /tmp/autojobscrapper

# Make deploy script executable
chmod +x deploy.sh

# Run deployment (will install everything)
sudo ./deploy.sh

# This will:
# - Install Python, Node.js, Nginx
# - Install Playwright dependencies
# - Create systemd services
# - Build frontend
# - Configure Nginx
```

### Step 4: Copy Your .env File (1 min)
```bash
# Copy your working .env
sudo cp /tmp/backend.env /opt/eperolehan-scraper/backend/.env

# Set correct permissions
sudo chown root:root /opt/eperolehan-scraper/backend/.env
sudo chmod 600 /opt/eperolehan-scraper/backend/.env
```

### Step 5: Restart Services (1 min)
```bash
# Restart all services
sudo systemctl restart eperolehan-api
sudo systemctl restart eperolehan-scheduler
sudo systemctl restart nginx

# Check status
sudo systemctl status eperolehan-api
sudo systemctl status eperolehan-scheduler
```

### Step 6: Verify (2 min)
```bash
# Check logs
sudo journalctl -u eperolehan-api -n 20
sudo journalctl -u eperolehan-scheduler -n 20

# Test API
curl http://localhost:8000/
curl http://localhost:8000/api/stats
```

---

## 🌐 Access Your App

Open browser on any device in your network:
**http://192.168.1.110**

---

## 📋 Quick Copy-Paste Commands

**From Windows:**
```powershell
cd C:\document\MRS\autojobscrapper
scp -r backend src index.html package.json vite.config.ts postcss.config.mjs deploy.sh meerul@192.168.1.110:/tmp/autojobscrapper/
scp backend\.env meerul@192.168.1.110:/tmp/backend.env
ssh meerul@192.168.1.110
```

**On Ubuntu VPS:**
```bash
cd /tmp/autojobscrapper
chmod +x deploy.sh
sudo ./deploy.sh
sudo cp /tmp/backend.env /opt/eperolehan-scraper/backend/.env
sudo systemctl restart eperolehan-api eperolehan-scheduler nginx
sudo systemctl status eperolehan-api
```

---

**Total Time:** ~15 minutes  
**Ready to start!** 🚀
