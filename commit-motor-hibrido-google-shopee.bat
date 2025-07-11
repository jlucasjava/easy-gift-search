@echo off
echo =======================================================
echo COMMIT E PUSH - MOTOR HIBRIDO COM GOOGLE + SHOPEE
echo =======================================================
echo.

git add backend/services/hybridSearchService.js
git add backend/services/priceExtractor.js
git add backend/services/shopeeAPIService.js
git add backend/services/googleSearchService.js
git add backend/testar-motor-hibrido-google-shopee.js
git add RESUMO_NOVAS_IMPLEMENTACOES.md
git add testar-hibrido-google-shopee.bat
git add salvar-implementacao-google-shopee.bat

git commit -m "Melhoria do motor hibrido com integracao Google + Shopee e filtro de precos aprimorado"

git push

echo.
echo Commit e push concluidos!
echo.
echo Pressione qualquer tecla para sair...
pause > nul
