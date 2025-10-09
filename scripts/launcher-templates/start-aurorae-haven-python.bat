@echo off
REM Launcher for Aurorae Haven using Python (Windows)

echo.
echo ========================================
echo   Aurorae Haven - Starting (Python)...
echo ========================================
echo.

REM Check if Python is installed
where python >nul 2>&1
if %errorlevel% equ 0 (
    python embedded-server.py
    goto :end
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    python3 embedded-server.py
    goto :end
)

echo ERROR: Python is not installed!
echo.
echo Please install Python from: https://www.python.org/
echo.
pause
exit /b 1

:end
pause
