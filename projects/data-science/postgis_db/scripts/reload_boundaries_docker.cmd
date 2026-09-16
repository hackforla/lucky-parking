@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0reload_boundaries_docker.ps1" %*
exit /b %ERRORLEVEL%
