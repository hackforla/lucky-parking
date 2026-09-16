@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0db-status.ps1" %*
exit /b %ERRORLEVEL%
