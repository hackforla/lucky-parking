@echo off
REM End-to-end check of a running local stack (no execution-policy change needed).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0smoke_test.ps1" %*
