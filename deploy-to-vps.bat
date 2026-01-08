@echo off
REM VPS Deployment Script for Windows
REM This uploads the project to your VPS and runs deployment

echo ========================================
echo ePerolehan Scraper - VPS Deployment
echo ========================================
echo.

set VPS_USER=meerul
set VPS_IP=192.168.1.110
set VPS_PATH=/tmp/autojobscrapper

echo [1/3] Uploading project to VPS...
echo This may take a few minutes...
echo.

REM Use SCP to upload (will prompt for password)
scp -r ^
    -o "StrictHostKeyChecking=no" ^
    backend ^
    src ^
    index.html ^
    package.json ^
    vite.config.ts ^
    postcss.config.mjs ^
    deploy.sh ^
    %VPS_USER%@%VPS_IP%:%VPS_PATH%/

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Upload failed! Check your VPS connection.
    pause
    exit /b 1
)

echo.
echo ✅ Upload complete!
echo.
echo [2/3] Connecting to VPS to run deployment...
echo.

REM SSH and run deployment
ssh %VPS_USER%@%VPS_IP% "cd %VPS_PATH% && chmod +x deploy.sh && sudo ./deploy.sh"

echo.
echo [3/3] Deployment script completed!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Copy your .env file to VPS:
echo    scp backend\.env %VPS_USER%@%VPS_IP%:/tmp/backend.env
echo.
echo 2. SSH into VPS and configure:
echo    ssh %VPS_USER%@%VPS_IP%
echo    sudo cp /tmp/backend.env /opt/eperolehan-scraper/backend/.env
echo    sudo systemctl restart eperolehan-api eperolehan-scheduler
echo.
echo 3. Access your app:
echo    http://%VPS_IP%
echo.
pause
