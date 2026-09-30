@echo off
title Hostel Midnight Pantry
echo Starting Hostel Midnight Pantry Server...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
