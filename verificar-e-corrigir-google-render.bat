@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    VERIFICACAO E CORRECAO DO GOOGLE SEARCH API
echo           NO AMBIENTE DE PRODUCAO (RENDER)
echo ======================================================
echo.

echo [1/4] Verificando configuracao local...
node verificar-google-search-render.js
if %errorlevel% neq 0 (
    echo Erro ao executar o script de verificacao.
    goto :error
)

echo.
echo [2/4] Gerando instrucoes para correcao no Render...
echo - Instrucoes geradas no arquivo RENDER_CONFIG_ATUALIZADO.md
echo.

echo [3/4] ATENCAO: Agora voce precisa:
echo 1. Acessar o dashboard do Render (https://dashboard.render.com/)
echo 2. Configurar as variaveis de ambiente conforme as instrucoes
echo 3. Realizar o deploy com cache limpo
echo 4. Aguardar a conclusao do deploy
echo.

set /p continuar=Voce ja realizou essas acoes? (S/N): 

if /i "%continuar%" neq "S" (
    echo.
    echo Por favor, siga as instrucoes no arquivo RENDER_CONFIG_ATUALIZADO.md
    echo Execute este script novamente apos completar as acoes necessarias.
    goto :end
)

echo.
echo [4/4] Testando a configuracao no Render...
node testar-configuracao-render.js
if %errorlevel% neq 0 (
    echo Erro ao executar o script de teste.
    goto :error
)

echo.
echo ======================================================
echo             PROCESSO CONCLUIDO COM SUCESSO
echo ======================================================
echo.
echo Verifique os resultados dos testes acima para confirmar
echo que a Google Custom Search API esta funcionando corretamente.
echo.
goto :end

:error
echo.
echo ======================================================
echo                     ERRO ENCONTRADO
echo ======================================================
echo.
echo Um erro ocorreu durante a execucao do script.
echo Por favor, verifique as mensagens acima para mais detalhes.
echo.

:end
pause
