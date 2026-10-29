@echo off
title SmartPark Campus - Development Server
cd /d "%~dp0"
echo ====================================================================
echo   SMARTPARK CAMPUS - STARTING LOCAL SERVER
echo   Indian Institute of Technology ^& Management (IITM Campus)
echo ====================================================================
echo.
if not exist "node_modules\" (
    echo [1/2] Installing dependencies (first run only)...
    call npm.cmd install --no-audit --no-fund
    if %ERRORLEVEL% NEQ 0 (
        echo Retrying using package mirror...
        call npm.cmd install --registry=https://registry.npmmirror.com --no-audit --no-fund
    )
) else (
    echo [1/2] Dependencies already verified.
)
echo.
echo [2/2] Starting Next.js Local Server on http://localhost:3000 ...
echo.
echo --------------------------------------------------------------------
echo Application will be available at: http://localhost:3000
echo Keep this window open while using the application.
echo --------------------------------------------------------------------
call npm.cmd run dev
pause
