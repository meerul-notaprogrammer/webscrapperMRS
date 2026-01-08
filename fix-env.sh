#!/bin/bash
# Fix .env file TAG_KEYWORDS JSON syntax

echo "🔧 Fixing .env file..."

# Backup current .env
sudo cp /opt/eperolehan-scraper/backend/.env /opt/eperolehan-scraper/backend/.env.backup

# Fix TAG_KEYWORDS line - replace multiline JSON with single line
sudo sed -i '/TAG_KEYWORDS=/c\TAG_KEYWORDS={"Computer":["komputer","computer","laptop","pc","desktop"],"Software":["software","perisian","aplikasi","program"],"CCTV":["cctv","kamera","camera","surveillance","pengawasan"],"Printer":["printer","pencetak","photocopier"],"Hardware":["hardware","perkakasan"],"Stationery":["stationery","alat tulis","pen","pencil","kertas"],"Furniture":["furniture","perabot","meja","kerusi","cabinet"],"Security":["security","keselamatan","alarm"],"Maintenance":["penyelenggaraan","maintenance","repair"],"Networking":["network","rangkaian","router","switch"]}' /opt/eperolehan-scraper/backend/.env

# Remove any extra lines that were part of the multiline JSON
sudo sed -i '/"Computer":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"Software":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"CCTV":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"Printer":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"Hardware":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"Stationery":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"Furniture":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"Security":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"Maintenance":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/"Networking":/d' /opt/eperolehan-scraper/backend/.env
sudo sed -i '/^}$/d' /opt/eperolehan-scraper/backend/.env

echo "✅ .env file fixed!"
echo ""
echo "Restarting services..."
sudo systemctl restart eperolehan-api
sudo systemctl restart eperolehan-scheduler

sleep 2

echo ""
echo "Checking service status..."
sudo systemctl status eperolehan-api --no-pager | head -n 10

echo ""
echo "Testing API..."
curl http://localhost:8000/ 2>/dev/null && echo "✅ API is running!" || echo "❌ API still not responding"
