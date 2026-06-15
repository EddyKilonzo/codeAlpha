@echo off
setlocal

:: ── Self-elevating launcher for Network Sniffer Dashboard ──────────────────
:: If not running as Administrator, relaunch this same .bat file elevated.
:: The elevated instance then drops into the :run section and starts Python.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

:: ── Already elevated ────────────────────────────────────────────────────────
:run
title  Network Sniffer Dashboard
cd /d "%~dp0"
python sniffer_dashboard.py
echo.
echo  Dashboard exited.
pause
