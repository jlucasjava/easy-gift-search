@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    SOLUCAO PARA PROBLEMA DO GOOGLE SEARCH API
echo    RETORNANDO 0 RESULTADOS NO RENDER
echo ======================================================
echo.

echo [1/4] Verificando problemas no processamento de resultados...
node verificar-processamento-resultados.js
if %errorlevel% neq 0 (
    echo Erro ao executar o script de verificacao.
    pause
    exit /b 1
)
echo.

echo [2/4] Testando a API com consultas simples...
node teste-google-simples.js
if %errorlevel% neq 0 (
    echo Erro ao executar o script de teste simples.
    pause
    exit /b 1
)
echo.

echo [3/4] Ajustando parametros da busca para ser menos restritiva...
set /p ajustar=Deseja ajustar os parametros da busca para tornar menos restritiva? (S/N): 

if /i "!ajustar!"=="S" (
    node ajustar-parametros-busca.js
    if %errorlevel% neq 0 (
        echo Erro ao ajustar parametros.
        pause
        exit /b 1
    )
) else (
    echo Ajuste de parametros ignorado.
)
echo.

echo [4/4] Instrucoes para deploy no Render...
echo.
echo Para aplicar as alteracoes no ambiente Render:
echo 1. Faca commit e push das alteracoes para o repositorio:
echo    git add .
echo    git commit -m "fix: Ajuste de parametros da Google Search API para obter resultados"
echo    git push
echo.
echo 2. Acesse o painel do Render (https://dashboard.render.com/)
echo 3. Navegue ate o servico "easy-gift-search"
echo 4. Clique em "Manual Deploy" e selecione "Clear Build Cache & Deploy"
echo 5. Aguarde o deploy ser concluido
echo 6. Teste a aplicacao para ver se retorna produtos reais
echo.

echo ======================================================
echo             PROCESSO CONCLUIDO COM SUCESSO
echo ======================================================
echo.
pause
