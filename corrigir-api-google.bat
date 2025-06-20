@echo off
echo =========================================
echo ASSISTENTE DE CORREÇÃO DA API DO GOOGLE
echo =========================================
echo.
echo Este batch vai ajudar você a diagnosticar e corrigir 
echo problemas com a API do Google Custom Search.
echo.
echo Iniciando o assistente...
echo.

cd %~dp0backend
node fix-google-api-error.js

echo.
echo Assistente finalizado.
echo.
pause
