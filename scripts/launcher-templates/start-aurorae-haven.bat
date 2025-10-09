@echo off
REM Launcher for Aurorae Haven (Windows)

echo.
echo ========================================
echo   Aurorae Haven - Starting...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Start the embedded server
node embedded-server.js

pause
