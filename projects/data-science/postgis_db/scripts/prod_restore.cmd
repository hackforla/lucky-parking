@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0prod_restore.ps1" %*
exit /b %ERRORLEVEL%
