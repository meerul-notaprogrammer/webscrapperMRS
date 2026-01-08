@echo off
REM ePerolehan Scraper - Local Development Setup (Windows)

echo ========================================
echo ePerolehan Scraper - Local Setup
echo ========================================
echo.

echo [1/4] Setting up Python backend...
cd backend

REM Create virtual environment
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Install Playwright browser
echo Installing Playwright browser...
playwright install chromium

REM Create .env if not exists
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env and add your Supabase credentials!
    echo.
    pause
)

cd ..

echo.
echo [2/4] Setting up frontend...
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)

echo.
echo [3/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Edit backend\.env with your Supabase credentials
echo 2. Run backend\supabase_schema.sql in Supabase SQL Editor
echo 3. Run start-dev.bat to start both frontend and backend
echo.
pause
