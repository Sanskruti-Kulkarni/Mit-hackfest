@echo off
title JalMitra Water Governance Portal
echo ========================================================
echo   JalMitra (???????) - Farmer Water Sharing Portal
echo ========================================================
echo.
echo Opening JalMitra in your default web browser...
cd /d "%~dp0"

:: 1. Launch index.html directly in browser
start "" "index.html"

:: 2. If node or agy-node exists, also start server in background
if exist "C:\Users\Sanskruti\AppData\Roaming\Antigravity\bin\agy-node.cmd" (
    start /B "" "C:\Users\Sanskruti\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
) else (
    where node >nul 2>nul
    if %errorlevel% equ 0 (
        start /B "" node server.js
    )
)

echo.
echo [OK] JalMitra has been opened in your browser!
echo If you prefer a local server, visit: http://localhost:3000
echo.
pause
