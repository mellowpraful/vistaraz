@echo off
title CrisisOS Emergency Response Platform Launcher
color 0A
echo =========================================================================
echo               CRISISOS — INTELLIGENT EMERGENCY RESPONSE PLATFORM
echo =========================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/4] Verifying dependencies...
call npm install --no-audit

echo.
echo [3/4] Initializing SQLite database & seeding emergency demo telemetry...
call npx prisma db push
call npx tsx prisma/seed.ts

echo.
echo =========================================================================
echo    🚀 Launching CrisisOS Command Center on http://localhost:3000
echo =========================================================================
echo.
timeout /t 2 >nul
start "" "http://localhost:3000"
call npm run dev

pause
