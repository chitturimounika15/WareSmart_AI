#!/bin/bash
# WareSmart AI - Automatic Setup Script for Linux/Mac
# This script sets up both backend and frontend

echo ""
echo "============================================"
echo "    WareSmart AI - Complete Setup"
echo "============================================"
echo ""

# Check Python
echo "[1/4] Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 not found. Please install Python 3.8+"
    exit 1
fi
echo "OK: Python found"
python3 --version

# Check Node.js
echo "[2/4] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 16+"
    exit 1
fi
echo "OK: Node.js found"
node --version

# Setup Backend
echo "[3/4] Setting up backend..."
cd backend || exit 1
python3 -m venv .venv
source .venv/bin/activate
pip install -q -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
echo "Seeding database..."
python3 seed.py
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to seed database"
    exit 1
fi
echo "OK: Backend ready"
cd ..

# Setup Frontend
echo "[4/4] Setting up frontend..."
cd frontend || exit 1
npm install --silent
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
echo "OK: Frontend ready"
cd ..

echo ""
echo "============================================"
echo "    Setup Complete!"
echo "============================================"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source .venv/bin/activate"
echo "  python -m uvicorn app.main:app --reload"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Backend API: http://127.0.0.1:8000"
echo "API Docs:   http://127.0.0.1:8000/docs"
echo ""
