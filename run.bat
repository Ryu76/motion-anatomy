@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

title Motion Anatomy

REM ===========================================================================
REM Environment Check (Node.js & npm)
REM ===========================================================================
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not registered in PATH.
    echo Please install Node.js from https://nodejs.org and try again.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm was not found.
    pause
    exit /b 1
)

REM Check for pnpm availability
where pnpm >nul 2>&1
if %errorlevel% equ 0 (
    set "DEV_CMD=pnpm dev"
) else (
    set "DEV_CMD=npm run dev"
)

REM Check dependencies (node_modules) and install if missing
if not exist "apps\web\node_modules" (
    echo [INFO] Dependencies not found. Installing required packages...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM ===========================================================================
REM Command Line Arguments (e.g., run.bat web, run.bat all, run.bat api)
REM ===========================================================================
if /i "%~1"=="web"    goto RUN_WEB
if /i "%~1"=="1"      goto RUN_WEB
if /i "%~1"=="all"    goto RUN_ALL
if /i "%~1"=="2"      goto RUN_ALL
if /i "%~1"=="api"    goto RUN_API
if /i "%~1"=="3"      goto RUN_API
if /i "%~1"=="docker" goto RUN_DOCKER
if /i "%~1"=="4"      goto RUN_DOCKER
if /i "%~1"=="verify" goto RUN_VERIFY
if /i "%~1"=="test"   goto RUN_VERIFY
if /i "%~1"=="5"      goto RUN_VERIFY
if /i "%~1"=="exit"   goto EXIT
if /i "%~1"=="0"      goto EXIT

REM ===========================================================================
REM Interactive Menu
REM ===========================================================================
cls
echo =====================================================================
echo                     Motion Anatomy Launcher
echo =====================================================================
echo.
echo   [1] Web App Only (Next.js 3D Viewer) [Default]
echo       - URL: http://localhost:3000
echo       - 3D anatomy viewer, layer controls, structure info panel
echo.
echo   [2] Full Stack (Web App + FastAPI Backend)
echo       - Web: http://localhost:3000
echo       - API: http://localhost:8000 (Swagger Docs: /docs)
echo.
echo   [3] FastAPI Backend Only
echo       - URL: http://localhost:8000
echo.
echo   [4] Docker Compose (API + PostgreSQL)
echo       - Requires Docker Desktop running
echo.
echo   [5] Verify Project (npm run verify)
echo.
echo   [0] Exit
echo =====================================================================
echo.
choice /c 123450 /t 3 /d 1 /m "Select an option [1-5, 0] (Defaults to 1 in 3s): "

if errorlevel 6 goto EXIT
if errorlevel 5 goto RUN_VERIFY
if errorlevel 4 goto RUN_DOCKER
if errorlevel 3 goto RUN_API
if errorlevel 2 goto RUN_ALL
if errorlevel 1 goto RUN_WEB

REM ===========================================================================
REM 1. Web App Only
REM ===========================================================================
:RUN_WEB
echo.
echo =====================================================================
echo  [Starting Web App] http://localhost:3000
echo  Launching browser and Next.js dev server...
echo  (Press Ctrl + C in this terminal to stop)
echo =====================================================================
echo.
start http://localhost:3000
call %DEV_CMD%
goto END

REM ===========================================================================
REM 2. Full Stack (Web + FastAPI)
REM ===========================================================================
:RUN_ALL
echo.
echo =====================================================================
echo  [Starting Full Stack] Web App + FastAPI Backend
echo  - Web: http://localhost:3000
echo  - API: http://localhost:8000
echo =====================================================================
echo.
if exist "apps\api\.venv\Scripts\python.exe" (
    echo [1/2] Starting FastAPI backend in a new window...
    start "Motion Anatomy - FastAPI (Port 8000)" cmd /k "cd /d """%~dp0""" && apps\api\.venv\Scripts\python.exe -m uvicorn motion_anatomy_api.main:app --app-dir apps/api/src --reload --port 8000"
) else (
    echo [WARNING] apps/api/.venv not found. Starting Web App only.
)

timeout /t 1 /nobreak >nul
start http://localhost:3000
echo [2/2] Starting Web App dev server...
call %DEV_CMD%
goto END

REM ===========================================================================
REM 3. FastAPI Backend Only
REM ===========================================================================
:RUN_API
echo.
echo =====================================================================
echo  [Starting FastAPI Backend] http://localhost:8000/docs
echo  (Press Ctrl + C to stop)
echo =====================================================================
echo.
if not exist "apps\api\.venv\Scripts\python.exe" (
    echo [ERROR] apps/api/.venv virtual environment was not found.
    echo Please run 'uv sync --project apps/api --dev' first.
    pause
    goto END
)
start http://localhost:8000/docs
apps\api\.venv\Scripts\python.exe -m uvicorn motion_anatomy_api.main:app --app-dir apps/api/src --reload --port 8000
goto END

REM ===========================================================================
REM 4. Docker Compose
REM ===========================================================================
:RUN_DOCKER
echo.
echo =====================================================================
echo  [Starting Docker Compose] API + PostgreSQL
echo =====================================================================
echo.
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker was not found. Please ensure Docker Desktop is running.
    pause
    goto END
)

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] .env not found. Creating .env from .env.example...
        copy .env.example .env >nul
    )
)

docker compose up -d --build
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Containers started successfully.
    echo  - API: http://localhost:8000/docs
    echo  - PostgreSQL: 127.0.0.1:15432
    start http://localhost:8000/docs
) else (
    echo.
    echo [ERROR] Docker Compose failed to start.
)
pause
goto END

REM ===========================================================================
REM 5. Verify Project
REM ===========================================================================
:RUN_VERIFY
echo.
echo =====================================================================
echo  [Running Project Verification]
echo =====================================================================
echo.
call npm run verify
pause
goto END

REM ===========================================================================
REM Exit
REM ===========================================================================
:EXIT
echo Exiting launcher.
exit /b 0

:END
echo.
echo Execution completed.
pause
