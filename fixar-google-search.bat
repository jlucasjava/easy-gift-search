@echo off
echo =====================================================
echo    FIXANDO CONFIGURACAO DO GOOGLE CUSTOM SEARCH API
echo =====================================================
echo.

echo 1. Executando script de correção...
node fixar-google-search-api.js
echo.

echo 2. Fazendo commit das alterações...
git add .
git commit -m "Corrigir configuração da Google Search API para garantir que esteja ativa"
echo.

echo 3. Enviando alterações para o repositório remoto...
git push
echo.

echo 4. Testando a API do Google...
cd backend
node teste-google-only.js
cd ..
echo.

echo 5. Processo concluído!
echo.
echo =====================================================
echo    IMPORTANTE: CONFIGURACAO PARA AMBIENTE DE PRODUCAO
echo =====================================================
echo.
echo Certifique-se de que as seguintes variáveis estão configuradas no painel da sua plataforma de deploy:
echo.
echo USE_GOOGLE_SEARCH_API=true
echo GOOGLE_SEARCH_API_KEY=%GOOGLE_SEARCH_API_KEY%
echo GOOGLE_SEARCH_CX=%GOOGLE_SEARCH_CX%
echo.
echo Após configurar, faça um novo deploy da aplicação.
echo.
pause
