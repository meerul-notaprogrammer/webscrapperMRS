---
description: Deploy autojobscrapper to VPS at 192.168.1.110
---

# Deploy to VPS Workflow

This workflow deploys the ePerolehan scraper to your Ubuntu VPS.

## Prerequisites
- VPS is online at 192.168.1.110
- SSH access configured (user: meerul)
- Supabase credentials ready

## Step 1: Compress Project Files

From the project root on Windows:

```powershell
cd C:\document\MRS
tar -czf autojobscrapper.tar.gz autojobscrapper --exclude=node_modules --exclude=.venv --exclude=dist --exclude=.git --exclude=__pycache__
```

## Step 2: Upload to VPS

```powershell
scp autojobscrapper.tar.gz meerul@192.168.1.110:/tmp/
```

## Step 3: SSH and Extract

```bash
ssh meerul@192.168.1.110
cd /tmp
tar -xzf autojobscrapper.tar.gz
cd autojobscrapper
```

## Step 4: Run Deployment Script

// turbo
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

## Step 5: Upload Environment File

Exit SSH and from Windows:

```powershell
scp backend\.env meerul@192.168.1.110:/tmp/backend.env
```

Then back on VPS:

```bash
ssh meerul@192.168.1.110
sudo cp /tmp/backend.env /opt/eperolehan-scraper/backend/.env
sudo chown meerul:meerul /opt/eperolehan-scraper/backend/.env
sudo chmod 600 /opt/eperolehan-scraper/backend/.env
```

## Step 6: Update CORS Origins

Edit the .env file to allow VPS IP:

```bash
sudo nano /opt/eperolehan-scraper/backend/.env
```

Add to CORS_ORIGINS:
```
CORS_ORIGINS=http://localhost:5173,http://192.168.1.110
```

## Step 7: Restart Services

// turbo
```bash
sudo systemctl restart eperolehan-api
sudo systemctl restart eperolehan-scheduler
sudo systemctl restart nginx
```

## Step 8: Verify Deployment

// turbo
```bash
sudo systemctl status eperolehan-api
sudo systemctl status eperolehan-scheduler
curl http://localhost:8000/
curl http://localhost:8000/api/stats
```

## Step 9: Access Frontend

Open browser to: **http://192.168.1.110**

## Troubleshooting

If services fail:
```bash
sudo journalctl -u eperolehan-api -n 50
sudo journalctl -u eperolehan-scheduler -n 50
```

If Playwright fails:
```bash
cd /opt/eperolehan-scraper/backend
source venv/bin/activate
playwright install-deps
playwright install chromium
```
