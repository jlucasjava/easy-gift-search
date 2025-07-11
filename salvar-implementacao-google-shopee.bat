@echo off
echo =======================================================
echo SALVANDO IMPLEMENTACOES DO MOTOR HIBRIDO COM GOOGLE + SHOPEE
echo =======================================================
echo.

REM Criar pasta de backup se não existir
if not exist "backup\30-06-2025" mkdir "backup\30-06-2025"

REM Copiar arquivos modificados para o backup
echo Copiando arquivos modificados para backup...
copy "backend\services\hybridSearchService.js" "backup\30-06-2025\hybridSearchService.js"
copy "backend\services\priceExtractor.js" "backup\30-06-2025\priceExtractor.js"
copy "backend\services\shopeeAPIService.js" "backup\30-06-2025\shopeeAPIService.js"
copy "backend\services\googleSearchService.js" "backup\30-06-2025\googleSearchService.js"
copy "backend\testar-motor-hibrido-google-shopee.js" "backup\30-06-2025\testar-motor-hibrido-google-shopee.js"
copy "RESUMO_NOVAS_IMPLEMENTACOES.md" "backup\30-06-2025\RESUMO_NOVAS_IMPLEMENTACOES.md"
copy "testar-hibrido-google-shopee.bat" "backup\30-06-2025\testar-hibrido-google-shopee.bat"

echo.
echo Backup concluido com sucesso!
echo.
echo Pressione qualquer tecla para sair...
pause > nul
