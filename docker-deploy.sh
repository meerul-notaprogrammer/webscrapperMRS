#!/bin/bash

# ePerolehan Scraper - Docker Deployment Script
# Run this on your Ubuntu VPS

set -e

echo "🐳 ePerolehan Scraper - Docker Deployment"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/eperolehan-scraper"

echo -e "${YELLOW}📦 Step 1: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    # Install Docker
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

echo -e "${YELLOW}📁 Step 2: Setting up project directory...${NC}"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

echo -e "${YELLOW}📥 Step 3: Copying project files...${NC}"
cp -r * $PROJECT_DIR/
cd $PROJECT_DIR

echo -e "${YELLOW}⚙️ Step 4: Checking environment file...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ ERROR: backend/.env file not found!${NC}"
    echo -e "${YELLOW}Please upload your .env file before continuing.${NC}"
    echo -e "Run: scp backend\\.env meerul@192.168.1.110:/tmp/backend.env"
    echo -e "Then: sudo cp /tmp/backend.env $PROJECT_DIR/backend/.env"
    exit 1
else
    echo -e "${GREEN}✅ Environment file found${NC}"
fi

echo -e "${YELLOW}📦 Step 5: Building frontend...${NC}"
if ! command -v npm &> /dev/null; then
    sudo apt-get install -y nodejs npm
fi
npm install
npm run build

echo -e "${YELLOW}🐳 Step 6: Building Docker images...${NC}"
docker compose build

echo -e "${YELLOW}🚀 Step 7: Starting containers...${NC}"
docker compose up -d

echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📊 Container Status:"
docker compose ps
echo ""
echo "🔗 Access your app at: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "📋 Useful Commands:"
echo "  View logs:        docker compose logs -f"
echo "  Stop services:    docker compose down"
echo "  Restart services: docker compose restart"
echo "  View API logs:    docker compose logs -f api"
echo "  View scheduler:   docker compose logs -f scheduler"
echo ""
