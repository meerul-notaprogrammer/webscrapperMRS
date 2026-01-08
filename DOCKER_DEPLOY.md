# Docker Deployment Guide

## 🐳 Why Docker?

This deployment uses Docker containers to:
- **Isolate services** - Each project runs independently
- **Avoid conflicts** - No port or dependency conflicts
- **Easy management** - Start/stop with simple commands
- **Clean VPS** - Remove projects completely with one command
- **Scalable** - Add more projects easily

## 📦 What Gets Deployed

### **3 Containers:**
1. **eperolehan-api** - FastAPI backend (Port 8000)
2. **eperolehan-scheduler** - Background scraper scheduler
3. **eperolehan-nginx** - Web server & reverse proxy (Port 80)

### **Architecture:**
```
Internet → Nginx (Port 80) → Frontend (static files)
                           → Backend API (Port 8000)
                           
Backend API ← Scheduler (runs scraper on schedule)
```

---

## 🚀 Quick Deployment

### **Step 1: Push to GitHub**

From Windows:
```powershell
cd C:\document\MRS\autojobscrapper
git add .
git commit -m "Add Docker configuration"
git push origin master
```

### **Step 2: Deploy on VPS**

SSH into your VPS:
```bash
ssh meerul@192.168.1.110
```

Clone and deploy:
```bash
# Remove old installation
sudo systemctl stop eperolehan-api eperolehan-scheduler 2>/dev/null || true
sudo rm -rf /opt/eperolehan-scraper

# Clone fresh
cd /opt
sudo git clone https://github.com/meerul-notaprogrammer/webscrapperMRS.git eperolehan-scraper
sudo chown -R meerul:meerul eperolehan-scraper
cd eperolehan-scraper

# Upload .env file (from another terminal on Windows)
# scp backend\.env meerul@192.168.1.110:/tmp/backend.env

# Copy .env file
sudo cp /tmp/backend.env backend/.env

# Run deployment
chmod +x docker-deploy.sh
./docker-deploy.sh
```

### **Step 3: Verify Deployment**

```bash
# Check containers
docker compose ps

# View logs
docker compose logs -f

# Test API
curl http://localhost/api/
curl http://localhost/api/stats
```

Access frontend: **http://192.168.1.110**

---

## 📋 Management Commands

### **View Logs**
```bash
cd /opt/eperolehan-scraper

# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f scheduler
docker compose logs -f nginx
```

### **Restart Services**
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart api
docker compose restart scheduler
```

### **Stop Services**
```bash
# Stop all containers
docker compose down

# Stop and remove volumes
docker compose down -v
```

### **Start Services**
```bash
docker compose up -d
```

### **Update Code**
```bash
cd /opt/eperolehan-scraper

# Pull latest code
git pull origin master

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d
```

---

## 🔧 Configuration

### **Environment Variables**
Edit `backend/.env`:
```bash
nano backend/.env
```

After changes:
```bash
docker compose restart
```

### **Nginx Configuration**
Edit `nginx.conf`:
```bash
nano nginx.conf
```

After changes:
```bash
docker compose restart nginx
```

---

## 🐛 Troubleshooting

### **Containers won't start**
```bash
# Check logs
docker compose logs

# Check specific container
docker compose logs api
```

### **Port already in use**
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop nginx  # If system nginx is running
```

### **Permission errors**
```bash
# Fix ownership
sudo chown -R meerul:meerul /opt/eperolehan-scraper
```

### **Rebuild from scratch**
```bash
cd /opt/eperolehan-scraper
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## 🌐 Adding More Projects

To add another project to your VPS:

1. **Create project directory:**
```bash
cd /opt
git clone <your-other-project>
```

2. **Configure different ports in docker-compose.yml:**
```yaml
ports:
  - "8001:8000"  # Different external port
```

3. **Update main Nginx** to route to different projects:
```nginx
# Project 1
location /project1 {
    proxy_pass http://localhost:8000;
}

# Project 2
location /project2 {
    proxy_pass http://localhost:8001;
}
```

---

## 📊 Resource Usage

Check container resource usage:
```bash
docker stats
```

---

## 🔒 Security Notes

- `.env` file contains sensitive data - never commit to git
- Containers run in isolated network
- Only ports 80 and 8000 are exposed
- Consider adding SSL/HTTPS for production

---

## ✅ Benefits Over Direct Installation

| Feature | Direct Install | Docker |
|---------|---------------|--------|
| Isolation | ❌ | ✅ |
| Easy cleanup | ❌ | ✅ |
| Multiple projects | ⚠️ Complex | ✅ Easy |
| Dependency conflicts | ⚠️ Possible | ✅ None |
| Portability | ❌ | ✅ |
| Rollback | ❌ | ✅ |

---

**Your VPS is now properly organized with Docker! 🎉**
