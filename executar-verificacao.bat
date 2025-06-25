@echo off
cd /d "%~dp0"
echo Instalando dependencias...
call npm install dotenv axios colors
echo.
echo Executando script de verificacao...
node verificar-google-search-render.js
echo.
pause
