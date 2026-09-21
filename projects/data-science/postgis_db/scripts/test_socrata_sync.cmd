@echo off
REM Probe Socrata incremental sync against PostGIS (dry-run unless --apply).
cd /d "%~dp0.."
py -3 scripts\test_socrata_sync.py %*
