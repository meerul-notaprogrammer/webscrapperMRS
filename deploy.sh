#!/bin/bash

# ePerolehan Scraper - VPS Deployment Script
# Run this on your Ubuntu VPS

set -e

echo "🚀 ePerolehan Scraper - VPS Deployment"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/eperolehan-scraper"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_CONF="/etc/nginx/sites-available/eperolehan"

echo -e "${YELLOW}📦 Step 1: Installing system dependencies...${NC}"
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx

echo -e "${YELLOW}📦 Step 2: Installing Playwright dependencies...${NC}"
# Ubuntu 24.04 compatible package names
sudo apt install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0t64 \
    libatk-bridge2.0-0t64 \
    libcups2t64 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2t64 \
    2>/dev/null || \
sudo apt install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2

echo -e "${YELLOW}📁 Step 3: Creating project directory...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

echo -e "${YELLOW}📥 Step 4: Copying project files...${NC}"
# Assuming you're running this from the project root
cp -r backend $PROJECT_DIR/
cp -r src $PROJECT_DIR/
cp -r index.html package.json vite.config.ts postcss.config.mjs $PROJECT_DIR/

echo -e "${YELLOW}🐍 Step 5: Setting up Python backend...${NC}"
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
playwright install chromium

echo -e "${YELLOW}⚙️ Step 6: Configuring environment...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > $BACKEND_DIR/.env << 'EOF'
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Scraper Settings
SCRAPE_SCHEDULE=0 8,14,20 * * *
TIMEZONE=Asia/Kuala_Lumpur

# ePerolehan URLs
EPEROLEHAN_BASE_URL=https://eperolehan.treasury.gov.my
EPEROLEHAN_SEARCH_URL=https://eperolehan.treasury.gov.my/ePerolehan/supplier/searchquotation.do

# Category Codes
CATEGORY_CODES=010302,020301,020302,020401,020601,120401,120501,120502,120503,130201,140301,140302,140501,140502,210101,210102,210103,210104,210105,210106,210107,210108,210109,210201,210202,210203,220402,221110,221502,221511

# Auto-Tagging Keywords
TAG_KEYWORDS={"Computer":["komputer","computer","laptop","pc","desktop"],"Software":["software","perisian","aplikasi","program"],"CCTV":["cctv","kamera","camera","surveillance","pengawasan"],"Printer":["printer","pencetak","photocopier"],"Hardware":["hardware","perkakasan"],"Stationery":["stationery","alat tulis","pen","pencil","kertas"],"Furniture":["furniture","perabot","meja","kerusi","cabinet"],"Security":["security","keselamatan","alarm"],"Maintenance":["penyelenggaraan","maintenance","repair"],"Networking":["network","rangkaian","router","switch"]}

# Scraper Behavior
HEADLESS_BROWSER=true
PAGE_TIMEOUT=30000
MAX_RETRIES=3
URGENT_DAYS_THRESHOLD=7

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://your-domain.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/scraper.log
EOF
    echo -e "${GREEN}✅ .env file created. IMPORTANT: Edit $BACKEND_DIR/.env with your Supabase credentials!${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo -e "${YELLOW}📦 Step 7: Building frontend...${NC}"
cd $PROJECT_DIR
npm install
npm run build

echo -e "${YELLOW}🔧 Step 8: Setting up systemd services...${NC}"

# API Service
sudo tee /etc/systemd/system/eperolehan-api.service > /dev/null << EOF
[Unit]
Description=ePerolehan Scraper API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
ExecStart=$BACKEND_DIR/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Scheduler Service
sudo tee /etc/systemd/system/eperolehan-scheduler.service > /dev/null << EOF
[Unit]
Description=ePerolehan Scraper Scheduler
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
ExecStart=$BACKEND_DIR/venv/bin/python scheduler_service.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${YELLOW}🌐 Step 9: Configuring Nginx...${NC}"
sudo tee $NGINX_CONF > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Change this to your domain

    # Frontend
    location / {
        root /opt/eperolehan-scraper/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t

echo -e "${YELLOW}🚀 Step 10: Starting services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable eperolehan-api
sudo systemctl enable eperolehan-scheduler
sudo systemctl start eperolehan-api
sudo systemctl start eperolehan-scheduler
sudo systemctl restart nginx

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Edit $BACKEND_DIR/.env with your Supabase credentials"
echo "2. Run Supabase schema: Copy backend/supabase_schema.sql to Supabase SQL Editor"
echo "3. Update Nginx config: sudo nano $NGINX_CONF (change your-domain.com)"
echo "4. Restart services: sudo systemctl restart eperolehan-api eperolehan-scheduler nginx"
echo ""
echo "📊 Service Status:"
sudo systemctl status eperolehan-api --no-pager | head -n 5
sudo systemctl status eperolehan-scheduler --no-pager | head -n 5
echo ""
echo "🔗 Access your app at: http://your-server-ip"
echo ""
