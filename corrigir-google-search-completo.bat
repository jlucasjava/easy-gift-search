@echo off
setlocal enabledelayedexpansion

echo =====================================================
echo    CORRECAO DA GOOGLE CUSTOM SEARCH API - COMPLETA
echo =====================================================
echo.
echo Este script executa todas as correcoes necessarias
echo para ativar a Google Custom Search API no ambiente
echo de producao (Render).
echo.

:menu
echo Selecione uma opcao:
echo [1] Verificar configuracao atual
echo [2] Corrigir deteccao da variavel USE_GOOGLE_SEARCH_API
echo [3] Gerar instrucoes para configuracao no Render
echo [4] Testar API apos configuracao no Render
echo [5] Executar todos os passos (recomendado)
echo [6] Sair
echo.
set /p opcao=Digite o numero da opcao desejada: 

if "%opcao%"=="1" goto :verificar
if "%opcao%"=="2" goto :corrigir
if "%opcao%"=="3" goto :instrucoes
if "%opcao%"=="4" goto :testar
if "%opcao%"=="5" goto :todos
if "%opcao%"=="6" goto :fim

echo.
echo Opcao invalida. Por favor, tente novamente.
echo.
goto :menu

:verificar
echo.
echo [1/4] Verificando configuracao atual...
node verificar-google-search-render.js
echo.
pause
goto :menu

:corrigir
echo.
echo [2/4] Corrigindo deteccao da variavel USE_GOOGLE_SEARCH_API...
node corrigir-deteccao-google-search.js
echo.
pause
goto :menu

:instrucoes
echo.
echo [3/4] Gerando instrucoes para configuracao no Render...
echo O arquivo GUIA_COMPLETO_ATIVACAO_GOOGLE_RENDER.md contem as instrucoes completas.
echo O arquivo RENDER_CONFIG_ATUALIZADO.md sera gerado com instrucoes especificas.
node verificar-google-search-render.js
echo.
echo Por favor, siga as instrucoes nos arquivos gerados para configurar o Render.
echo.
pause
goto :menu

:testar
echo.
echo [4/4] Testando API apos configuracao no Render...
echo.
echo IMPORTANTE: Execute este teste APOS realizar as configuracoes no Render.
echo.
set /p continuar=Voce ja configurou o Render conforme as instrucoes? (S/N): 

if /i "!continuar!" neq "S" (
    echo.
    echo Por favor, configure o Render primeiro seguindo as instrucoes.
    echo.
    pause
    goto :menu
)

node testar-configuracao-render.js
echo.
pause
goto :menu

:todos
echo.
echo [1/4] Verificando configuracao atual...
node verificar-google-search-render.js
if %errorlevel% neq 0 (
    echo Erro ao executar a verificacao.
    pause
    goto :menu
)

echo.
echo [2/4] Corrigindo deteccao da variavel USE_GOOGLE_SEARCH_API...
node corrigir-deteccao-google-search.js
if %errorlevel% neq 0 (
    echo Erro ao executar a correcao.
    pause
    goto :menu
)

echo.
echo [3/4] Gerando instrucoes para configuracao no Render...
echo O arquivo GUIA_COMPLETO_ATIVACAO_GOOGLE_RENDER.md contem as instrucoes completas.
echo O arquivo RENDER_CONFIG_ATUALIZADO.md foi gerado com instrucoes especificas.
echo.
echo PROXIMOS PASSOS:
echo 1. Faca commit e push das alteracoes para o repositorio
echo 2. Configure o Render seguindo as instrucoes nos arquivos gerados
echo 3. Faca deploy no Render com cache limpo
echo 4. Execute a opcao 4 do menu para testar a API apos a configuracao
echo.
pause
goto :menu

:fim
echo.
echo Obrigado por utilizar o script de correcao!
echo.
exit /b 0
