@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check_raw_data.ps1" %*
exit /b %ERRORLEVEL%
