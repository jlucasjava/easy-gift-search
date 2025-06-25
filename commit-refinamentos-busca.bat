@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    COMMIT E PUSH DOS REFINAMENTOS DA BUSCA
echo ======================================================
echo.

echo [1/4] Criando backup das alterações...
set timestamp=%date:~6,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set timestamp=!timestamp: =0!
copy /Y "backend\services\googleSearchService.js" "backend\services\googleSearchService.js.refinement-%timestamp%.bak" > nul
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao criar backup do arquivo.
    goto :erro
)
echo [OK] Backup criado com sucesso.
echo.

echo [2/4] Adicionando arquivos ao git...
git add backend/services/googleSearchService.js testar-refinamentos-busca.js
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao adicionar arquivos ao git.
    goto :erro
)
echo [OK] Arquivos adicionados ao git.
echo.

echo [3/4] Criando commit...
git commit -m "feat: Refinamento do filtro de busca para retornar links de produtos mais precisos"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao criar commit.
    goto :erro
)
echo [OK] Commit criado com sucesso.
echo.

echo [4/4] Enviando alterações para o repositório remoto...
git push
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao enviar alterações para o repositório remoto.
    goto :erro
)
echo [OK] Alterações enviadas para o repositório remoto.
echo.

echo ======================================================
echo    PRÓXIMOS PASSOS
echo ======================================================
echo.
echo 1. Execute o script de teste para verificar as melhorias:
echo    node testar-refinamentos-busca.js
echo.
echo 2. Reinicie o servidor em produção para aplicar as alterações:
echo    - No Render: Use "Clear Build Cache & Deploy"
echo    - No Vercel: Acione um novo deploy
echo.
echo 3. Teste a aplicação em produção para confirmar que as melhorias estão funcionando.
echo.
echo Pressione qualquer tecla para sair...
pause > nul
exit /b 0

:erro
echo.
echo Ocorreu um erro durante o processo.
echo Verifique as mensagens acima para identificar o problema.
echo.
pause
exit /b 1
