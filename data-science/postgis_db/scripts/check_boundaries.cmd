@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check_boundaries.ps1" %*
exit /b %ERRORLEVEL%
