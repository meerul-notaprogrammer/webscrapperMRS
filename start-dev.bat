@echo off
REM Start both backend and frontend for local development

echo ========================================
echo Starting ePerolehan Scraper
echo ========================================
echo.

REM Start backend in new window
echo Starting backend API...
start "ePerolehan API" cmd /k "cd backend && venv\Scripts\activate.bat && python main.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
echo Starting frontend...
start "ePerolehan Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Services Started!
echo ========================================
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all services...
pause > nul

REM Kill all related processes
taskkill /FI "WindowTitle eq ePerolehan API*" /T /F
taskkill /FI "WindowTitle eq ePerolehan Frontend*" /T /F

echo.
echo Services stopped.
