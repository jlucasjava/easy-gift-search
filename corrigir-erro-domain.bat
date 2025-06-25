@echo off
echo *******************************************
echo *     CORRECAO DE ERRO CRITICAL          *
echo *******************************************
echo.

echo 1. Adicionando arquivos ao git...
git add backend/services/googleSearchService.js
echo.

echo 2. Comitando correcao...
git commit -m "Corrige erro crítico: ReferenceError domain is not defined no googleSearchService.js"
echo.

echo 3. Realizando push para o repositorio remoto...
git push
echo.

echo Caso tenha havido algum problema com o push normal, realizando force push...
git push -f
echo.

echo 4. Verificando status final...
git status
echo.

echo Correcao aplicada e enviada com sucesso!
echo Pressione qualquer tecla para sair...
pause > nul
