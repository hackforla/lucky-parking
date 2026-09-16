@echo off
REM Preflight + docker compose up (Windows — no execution-policy change).
cd /d "%~dp0.."
call scripts\preflight.cmd %* || exit /b 1
docker compose up -d --build || exit /b 1
echo.
echo PostGIS first boot loads boundaries then citations (often 1-3+ hours).
echo API and explorer start after the load finishes.
echo.
echo   docker compose logs -f postgis
echo   scripts\db-status.cmd
echo.
echo Explorer: http://localhost:8080
echo API docs: http://localhost:8000/docs
