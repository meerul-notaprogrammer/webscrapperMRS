# Ports & Access Guide

## 🌐 How to Access Your Application

### **Frontend (Web Interface)**
- **URL:** http://192.168.1.110
- **Port:** 80
- **Container:** eperolehan-nginx

### **Backend API**
- **URL:** http://192.168.1.110/api/
- **Port:** 80 → proxied to 8000
- **Container:** eperolehan-api
- **Direct access:** http://192.168.1.110:8000 (if needed)

---

## 📊 Container Ports

| Service | Container Name | Internal Port | External Port | Purpose |
|---------|---------------|---------------|---------------|---------|
| Nginx | eperolehan-nginx | 80 | 80 | Web server & reverse proxy |
| API | eperolehan-api | 8000 | 8000 | FastAPI backend |
| Scheduler | eperolehan-scheduler | - | - | Background scraper (no external port) |

---

## 🔧 Port Configuration

### **Current Setup:**
```
Internet/Browser
    ↓
http://192.168.1.110:80 (Nginx)
    ↓
    ├─→ / → Frontend (static files in /dist)
    └─→ /api → Backend (proxy to api:8000)
```

### **To Change Ports:**

Edit `docker-compose.yml`:

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # Change 80 to any available port
  
  api:
    ports:
      - "8001:8000"  # Change 8000 to any available port
```

Then restart:
```bash
docker compose down
docker compose up -d
```

---

## 🚨 Port Conflicts

### **Error: "address already in use"**

**Find what's using the port:**
```bash
# Check port 80
sudo lsof -i :80

# Check port 8000
sudo lsof -i :8000
```

**Common solutions:**

1. **System Nginx running:**
```bash
sudo systemctl stop nginx
sudo systemctl disable nginx
```

2. **Old containers:**
```bash
docker ps -a
docker rm -f <container_name>
```

3. **Change port in docker-compose.yml** (see above)

---

## 🌍 Adding More Projects

### **Example: Running 3 Projects on Same VPS**

**Project 1 (ePerolehan):**
- Frontend: http://192.168.1.110
- API: http://192.168.1.110/api

**Project 2 (Another App):**
- Frontend: http://192.168.1.110:8080
- API: http://192.168.1.110:8001

**Project 3 (Third App):**
- Frontend: http://192.168.1.110:8081
- API: http://192.168.1.110:8002

### **Setup:**

Each project in its own directory:
```
/opt/
├── eperolehan-scraper/     (ports 80, 8000)
├── project2/               (ports 8080, 8001)
└── project3/               (ports 8081, 8002)
```

Each with its own `docker-compose.yml` with different ports.

---

## 🔒 Firewall (Optional)

If you want to restrict access:

```bash
# Allow only specific ports
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp
sudo ufw enable
```

---

## 📝 Quick Reference

### **Check what's running:**
```bash
docker compose ps
```

### **View logs:**
```bash
docker compose logs -f
```

### **Restart services:**
```bash
docker compose restart
```

### **Stop everything:**
```bash
docker compose down
```

### **Start everything:**
```bash
docker compose up -d
```

---

## ✅ Current Access Points

After successful deployment:

- **Main App:** http://192.168.1.110
- **API Health:** http://192.168.1.110/api/
- **API Stats:** http://192.168.1.110/api/stats
- **Manual Scrape:** http://192.168.1.110/api/scrape/manual

---

**Your VPS IP:** `192.168.1.110`  
**All services are containerized and isolated!** 🎉
