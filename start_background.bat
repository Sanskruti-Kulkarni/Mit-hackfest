@echo off
title JalMitra Water Governance Server
echo Starting JalMitra Background Service on http://localhost:3000 ...
cd /d "%~dp0"
if exist "C:\Users\Sanskruti\AppData\Roaming\Antigravity\bin\agy-node.cmd" (
    start /B "" "C:\Users\Sanskruti\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
) else (
    start /B "" node server.js
)
echo JalMitra is running in background at http://localhost:3000
