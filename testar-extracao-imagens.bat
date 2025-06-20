@echo off
echo ============================================
echo Teste de Extracao de Imagens Google Search
echo ============================================
echo.
echo Este script testa a extracao de imagens da API do Google
echo para garantir que todas as funcoes estao operando corretamente.
echo.
echo Executando teste...
echo.

cd backend
node test-image-extraction.js

echo.
echo ============================================
echo.
echo Para testar a integracao com o frontend, inicie o servidor
echo e acesse http://localhost:3000/api/monitor/test-image-extraction?query=presentes
echo.
echo Para ver as estatisticas de qualidade de imagens, acesse:
echo http://localhost:3000/api/monitor/image-quality
echo.
echo Pressione qualquer tecla para sair...
pause > nul
