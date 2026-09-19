@echo off
title AI-Powered Early Warning & Decision Intelligence System Launcher
echo =========================================================================
echo   AI-Powered Early Warning & Decision Intelligence System
echo   FastAPI Orchestration + Multi-Modal ML/NLP + LangGraph Agentic Loop
echo =========================================================================
echo.

echo [1/2] Launching Central FastAPI Backend (Port 5000)...
start "Banking AI - Central FastAPI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload"

echo [2/2] Launching React Vite Risk Intelligence Dashboard (Port 5173)...
start "Banking AI - React Dashboard" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo Opening Decision Intelligence Dashboard in browser at http://localhost:5173 ...
timeout /t 3 >nul
start http://localhost:5173
echo.
echo Press any key to exit launcher window (services keep running in their own windows).
pause
