@echo off
chcp 65001 >nul
color 0A
title Cai Dat Domain DSU.ThanhKhe.football.vn

:: Kiem tra quyen Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Dang yeu cau quyen Administrator...
    echo Vui long bam YES tren hop thoai vua xuat hien de tiep tuc.
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================================
echo   KICH HOAT DOMAIN: DSU.ThanhKhe.football.vn
echo ========================================================
echo.

set "HOSTS=%SystemRoot%\System32\drivers\etc\hosts"

:: Bo thuoc tinh Read-Only neu co
attrib -r "%HOSTS%" >nul 2>&1

:: Kiem tra domain da co chua
findstr /i "DSU.ThanhKhe.football.vn" "%HOSTS%" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Domain DSU.ThanhKhe.football.vn da co trong file hosts!
) else (
    echo [*] Dang ghi vao file hosts...
    echo.>>"%HOSTS%"
    echo 127.0.0.1 DSU.ThanhKhe.football.vn>>"%HOSTS%"
    echo 127.0.0.1 dsu.thanhkhe.football.vn>>"%HOSTS%"
    echo [OK] Da them domain vao file hosts thanh cong!
)

echo.
echo [*] Xoa cache DNS cua Windows (Flush DNS)...
ipconfig /flushdns >nul
echo [OK] Da lam moi DNS thanh cong!

echo.
echo ========================================================
echo   DA KICH HOAT THANH CONG!
echo   Dang mo trinh duyet toi: http://DSU.ThanhKhe.football.vn
echo ========================================================
echo.

start http://DSU.ThanhKhe.football.vn

echo Ban co the dong cua so nay.
pause
