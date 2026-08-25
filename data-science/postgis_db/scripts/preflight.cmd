@echo off
REM Verify boundaries + citations CSV (no PowerShell execution-policy change needed).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check_boundaries.ps1" %* || exit /b 1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check_raw_data.ps1" %* || exit /b 1
