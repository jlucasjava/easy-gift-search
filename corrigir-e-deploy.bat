@echo off
echo *******************************************
echo * CORRECAO E DEPLOY DO EASY GIFT SEARCH *
echo *******************************************
echo.

echo 1. Corrigindo erro de sintaxe...
cd backend
node fix-syntax-error.js
echo.

echo 2. Corrigindo configuração do Express...
node fix-trust-proxy.js
echo.

echo 3. Gerando instruções para Vercel...
node generate-vercel-instructions.js
echo.

echo 4. Comitando alterações...
cd ..
git add .
git commit -m "Corrige erros críticos: sintaxe no googleSearchService.js e configuração do Express"
echo.

echo 5. Enviando para o repositório...
git push -f
echo.

echo 6. Tudo pronto! Agora configure as variáveis de ambiente na Vercel conforme instruções no arquivo VERCEL_CONFIG_INSTRUCTIONS.md
echo.
echo Pressione qualquer tecla para sair...
pause > nul
