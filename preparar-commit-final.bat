@echo off
echo ====================================================================
echo PREPARANDO COMMIT FINAL PARA EASY GIFT SEARCH - VERSAO GOOGLE ONLY
echo ====================================================================

REM Diretórios importantes
set REPO_ROOT=c:\Users\ROSARJOS\OneDrive - Mars Inc\2025\Easy\easy-gift-search
set BACKEND_DIR=%REPO_ROOT%\backend
set PUBLIC_DIR=%REPO_ROOT%\public

echo.
echo 1) Adicionando arquivos de configuração e documentação...
git add .env.example
git add .env.production
git add README.md
git add IMPLEMENTACAO_GOOGLE_CUSTOM_SEARCH.md
git add IMPLEMENTACAO_CACHE_GOOGLE.md
git add INTEGRACAO_FRONTEND_BACKEND.md
git add MELHORIAS_UX_E_MONITORAMENTO.md
git add GOOGLE_SEARCH_API_SETUP_GUIDE.md
git add GOOGLE_SEARCH_ONLY_STATUS_FINAL.md
git add RESUMO_IMPLEMENTACAO_CACHE.md
git add RESUMO_INTEGRACAO_FRONTEND_BACKEND.md

echo.
echo 2) Adicionando arquivos do backend...
git add %BACKEND_DIR%\.env.example
git add %BACKEND_DIR%\.env.production
git add %BACKEND_DIR%\package.json
git add %BACKEND_DIR%\package-lock.json
git add %BACKEND_DIR%\server.js

echo.
echo 3) Adicionando controladores e rotas atualizados...
git add %BACKEND_DIR%\controllers\productController.js
git add %BACKEND_DIR%\controllers\recommendController.js
git add %BACKEND_DIR%\controllers\monitorController.js
git add %BACKEND_DIR%\routes\recommend.js
git add %BACKEND_DIR%\routes\monitor.js

echo.
echo 4) Adicionando serviços...
git add %BACKEND_DIR%\services\googleSearchService.js
git add %BACKEND_DIR%\services\simulateGoogleResults.js
git add %BACKEND_DIR%\services\apiMonitorService.js

echo.
echo 5) Adicionando scripts de teste e verificação...
git add %BACKEND_DIR%\test-google-only-consolidated.js
git add %BACKEND_DIR%\test-google-api-detailed.js
git add %BACKEND_DIR%\teste-cache-google.js
git add %BACKEND_DIR%\teste-parametros-otimizados.js
git add %BACKEND_DIR%\verify-production-environment.js
git add %BACKEND_DIR%\update-production-keys.js

echo.
echo 6) Adicionando arquivos do frontend...
git add %PUBLIC_DIR%\index.html
git add %PUBLIC_DIR%\js\app.js
git add %PUBLIC_DIR%\js\integration-checker.js
git add %PUBLIC_DIR%\css\enhanced-ui.css
git add %PUBLIC_DIR%\css\google-results.css

echo.
echo 7) Removendo serviços descontinuados...
git rm %BACKEND_DIR%\services\amazonServiceAWS.js
git rm %BACKEND_DIR%\services\aliexpressService.js
git rm %BACKEND_DIR%\services\bingSearchService.js
git rm %BACKEND_DIR%\services\googleMapsService.js
git rm %BACKEND_DIR%\services\gpt35Service.js
git rm %BACKEND_DIR%\services\llama2Service.js
git rm %BACKEND_DIR%\services\mercadoLivreService.js
git rm %BACKEND_DIR%\services\shopeeService.js

echo.
echo 8) Verificando status...
git status

echo.
echo Pronto para commit! Execute o comando 'git commit -m "Implementação completa da versão Google Custom Search Only"'
