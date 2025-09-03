@echo off
REM ENVISION Microscopy Analysis System - Startup Script for Windows
REM This script starts both the backend Flask server and the frontend React development server

echo 🚀 Starting ENVISION Microscopy Analysis System...
echo ==================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm 9+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Install Python dependencies if needed
if not exist "backend\venv" (
    echo 🐍 Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
) else (
    echo 🐍 Activating Python virtual environment...
    cd backend
    call venv\Scripts\activate.bat
    cd ..
)

REM Start backend server in background
echo 🔧 Starting backend Flask server...
cd backend
call venv\Scripts\activate.bat
start "ENVISION Backend" python app.py
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend development server
echo 🌐 Starting frontend React development server...
start "ENVISION Frontend" npm start

echo.
echo 🎉 ENVISION system is starting up!
echo ==================================
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5001
echo.
echo 💡 To start the Electron desktop app, run: npm run electron-dev
echo.
echo 🛑 Close the command windows to stop the services
echo.
pause
