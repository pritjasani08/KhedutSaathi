@echo off
echo Stopping KhedutSaathi AI Development Environment...

echo Stopping Node.js processes (Frontend and Backend)...
taskkill /F /IM node.exe /T

echo Stopping Python/Uvicorn processes (AI Services)...
taskkill /F /IM uvicorn.exe /T
taskkill /F /IM python.exe /T

echo All development services stopped!
