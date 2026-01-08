#!/bin/bash
# Quick fix script for Ubuntu 24.04 deployment

set -e

echo "🔧 Fixing deployment for Ubuntu 24.04..."

# Install missing Playwright dependencies with Ubuntu 24.04 package names
echo "📦 Installing Playwright dependencies..."
sudo apt install -y \
    libasound2t64 \
    libatk1.0-0t64 \
    libatk-bridge2.0-0t64 \
    libcups2t64 \
    2>/dev/null || echo "Some packages already installed"

# Create project directory if it doesn't exist
echo "📁 Creating project directory..."
sudo mkdir -p /opt/eperolehan-scraper/backend
sudo chown -R $USER:$USER /opt/eperolehan-scraper

# Copy files
echo "📂 Copying project files..."
cp -r /tmp/autojobscrapper/backend/* /opt/eperolehan-scraper/backend/
cp -r /tmp/autojobscrapper/src /opt/eperolehan-scraper/
cp /tmp/autojobscrapper/index.html /opt/eperolehan-scraper/
cp /tmp/autojobscrapper/package.json /opt/eperolehan-scraper/
cp /tmp/autojobscrapper/vite.config.ts /opt/eperolehan-scraper/
cp /tmp/autojobscrapper/postcss.config.mjs /opt/eperolehan-scraper/

# Setup Python backend
echo "🐍 Setting up Python backend..."
cd /opt/eperolehan-scraper/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
playwright install chromium

# Copy .env file
echo "⚙️ Copying environment file..."
sudo cp /tmp/backend.env /opt/eperolehan-scraper/backend/.env
sudo chown $USER:$USER /opt/eperolehan-scraper/backend/.env
chmod 600 /opt/eperolehan-scraper/backend/.env

# Build frontend
echo "📦 Building frontend..."
cd /opt/eperolehan-scraper
npm install
npm run build

# Create systemd services
echo "🔧 Creating systemd services..."

# API Service
sudo tee /etc/systemd/system/eperolehan-api.service > /dev/null << EOF
[Unit]
Description=ePerolehan Scraper API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/eperolehan-scraper/backend
Environment="PATH=/opt/eperolehan-scraper/backend/venv/bin"
ExecStart=/opt/eperolehan-scraper/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
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
WorkingDirectory=/opt/eperolehan-scraper/backend
Environment="PATH=/opt/eperolehan-scraper/backend/venv/bin"
ExecStart=/opt/eperolehan-scraper/backend/venv/bin/python scheduler_service.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/eperolehan > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

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

sudo ln -sf /etc/nginx/sites-available/eperolehan /etc/nginx/sites-enabled/
sudo nginx -t

# Start services
echo "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable eperolehan-api eperolehan-scheduler
sudo systemctl start eperolehan-api eperolehan-scheduler
sudo systemctl restart nginx

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
sudo systemctl status eperolehan-api --no-pager | head -n 5
sudo systemctl status eperolehan-scheduler --no-pager | head -n 5
echo ""
echo "🔗 Access your app at: http://192.168.1.110"
echo ""
