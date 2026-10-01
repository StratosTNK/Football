@echo off
chcp 65001 >nul
title Football Club Web Server

echo ========================================================
echo   KHOI DONG HE THONG CHIA DOI PHUI
echo   Dia chi: http://DSU.ThanhKhe.football.vn
echo ========================================================
echo.

cd /d "%~dp0"
npm run dev
pause
