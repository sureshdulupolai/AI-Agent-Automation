@echo off
title OmniBot SaaS Launcher
echo ========================================================
echo   Starting OmniBot Platform: Backend (5000) & Frontend (3000)
echo ========================================================

start "OmniBot Backend API (:5000)" cmd /k "cd backend && npm run dev"
start "OmniBot Frontend App (:3000)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up!
echo   Frontend UI : http://localhost:3000
echo   Backend API : http://localhost:5000
echo ========================================================
