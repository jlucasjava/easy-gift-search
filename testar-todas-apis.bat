@echo off
echo =======================================================
echo TESTE COMPLETO DE TODAS AS APIS - EASY GIFT SEARCH
echo =======================================================
echo.
echo Este teste analisara o desempenho de todas as APIs integradas:
echo - Google Search API
echo - Shopee API
echo - Motor Hibrido (Google + Shopee)
echo - Custom Search V1
echo - Custom Search V2
echo.
echo O teste pode levar varios minutos para ser concluido!
echo.
echo Executando teste...
echo.

cd backend
node testar-todas-apis.js

echo.
echo Teste concluido!
echo.
echo Os resultados estao disponiveis em:
echo - backend\resultado-teste-apis-completo.json (dados brutos)
echo - backend\relatorio-teste-apis-completo.html (relatorio visual)
echo.
echo Abrir relatorio visual no navegador? (S/N)
set /p opcao=

if /i "%opcao%"=="S" (
  start "" "backend\relatorio-teste-apis-completo.html"
)

echo.
echo Pressione qualquer tecla para sair...
pause > nul
