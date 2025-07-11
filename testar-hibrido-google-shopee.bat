@echo off
echo =======================================================
echo TESTE DO MOTOR HIBRIDO COM GOOGLE + SHOPEE
echo =======================================================
echo.
echo Executando teste do motor hibrido com integracao Google + Shopee...
echo.

cd backend
node testar-motor-hibrido-google-shopee.js > resultado-teste-hibrido-google-shopee.log

echo.
echo Teste concluido! Verifique o arquivo resultado-teste-hibrido-google-shopee.log
echo para ver os resultados detalhados.
echo.
echo Pressione qualquer tecla para sair...
pause > nul
