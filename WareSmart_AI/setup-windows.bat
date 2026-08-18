@echo off
REM WareSmart AI - Automatic Setup Script for Windows
REM This script sets up both backend and frontend

echo.
echo ============================================
echo    WareSmart AI - Complete Setup
echo ============================================
echo.

REM Check Python
echo [1/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.8+
    pause
    exit /b 1
)
echo OK: Python found

REM Check Node.js
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)
echo OK: Node.js found

REM Setup Backend
echo [3/4] Setting up backend...
cd backend
python -m pip install -q -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo Seeding database...
python seed.py
if errorlevel 1 (
    echo ERROR: Failed to seed database
    cd ..
    pause
    exit /b 1
)
echo OK: Backend ready
cd ..

REM Setup Frontend
echo [4/4] Setting up frontend...
cd frontend
call npm install --silent
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo OK: Frontend ready
cd ..

echo.
echo ============================================
echo    Setup Complete!
echo ============================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   python -m uvicorn app.main:app --reload
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo Backend API: http://127.0.0.1:8000
echo API Docs:   http://127.0.0.1:8000/docs
echo.
pause
