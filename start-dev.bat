@echo off
REM Aether Beasts Development Startup Script for Windows

echo Starting Aether Beasts Development Environment...

REM Check if backend port is available
netstat -an | findstr ":3001" >nul
if %errorlevel% == 0 (
    echo Backend port 3001 is already in use. Please stop the existing process.
    pause
    exit /b 1
)

REM Check if frontend port is available
netstat -an | findstr ":3000" >nul
if %errorlevel% == 0 (
    echo Frontend port 3000 is already in use. Please stop the existing process.
    pause
    exit /b 1
)

echo Starting Backend Server...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)
start /B cmd /c "npm run dev"
cd ..

echo Starting Frontend Server...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
start /B cmd /c "npm start"
cd ..

echo.
echo Aether Beasts is starting up!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo.
echo Press any key to stop all servers...
pause >nul

REM Kill Node.js processes (this is a simple approach)
taskkill /F /IM node.exe /T >nul 2>&1

echo All servers stopped.
pause
