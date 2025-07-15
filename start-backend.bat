@echo off
echo Starting Aether Beasts Backend Server...
cd /d "C:\PA\card-game-project\backend"
echo Current directory: %cd%
echo.
echo Checking if Node.js is available...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo.
echo Starting backend server...
npm run dev
pause
