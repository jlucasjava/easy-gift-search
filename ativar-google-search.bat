@echo off
echo =====================================================
echo    ATIVANDO GOOGLE CUSTOM SEARCH API
echo =====================================================
echo.

echo 1. Corrigindo dependencias circulares...
cd "c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search"
node corrigir-dependencias-circulares.js
echo.

echo 2. Verificando variaveis de ambiente...
echo USE_GOOGLE_SEARCH_API=true >> "c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search\backend\.env"
echo.

echo 3. Executando teste de API do Google...
cd "c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search\backend"
node teste-direto-google-api.js
echo.

echo 4. Commitando as alteracoes...
cd "c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search"
git add .
git commit -m "Ativar Google Custom Search API e corrigir dependencias circulares"
git push
echo.

echo 5. Teste concluido!
echo.
echo =====================================================
echo    INSTRUÇÕES PARA PRODUÇÃO
echo =====================================================
echo.
echo Certifique-se de que as seguintes variáveis estão configuradas no painel da sua plataforma de deploy:
echo.
echo USE_GOOGLE_SEARCH_API=true
echo GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
echo GOOGLE_SEARCH_CX=e17d0e713876e4dca
echo.
echo Após configurar, faça um novo deploy da aplicação.
echo.
pause
