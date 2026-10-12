@echo off
title QuizGenius AI - Single File Runner
color 0B
cd /d "%~dp0"

echo ================================================================
echo                    QuizGenius AI Launcher                       
echo ================================================================
echo.

if exist "backend\venv\Scripts\python.exe" (
    echo Starting servers via Python runner...
    backend\venv\Scripts\python.exe run.py
) else (
    echo Virtual environment not found in backend\venv, trying system python...
    python run.py
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python runner failed. Starting servers using native batch commands...
    start "QuizGenius AI Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && python app.py"
    start "QuizGenius AI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
    timeout /t 3 /nobreak >nul
    start http://localhost:5173
)

pause
