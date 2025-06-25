@echo off
setlocal enabledelayedexpansion

echo =====================================================
echo    COMMIT E PUSH DAS ALTERACOES DO GOOGLE SEARCH API
echo =====================================================
echo.

:: Definir mensagem de commit
set "mensagem=fix: Correcao da configuracao da Google Custom Search API"
set "descricao=- Melhorada a deteccao da variavel USE_GOOGLE_SEARCH_API\n- Adicionados scripts para verificacao e correcao\n- Criada documentacao atualizada para configuracao no Render"

echo Mensagem de commit: %mensagem%
echo.
echo Descricao:
echo - Melhorada a deteccao da variavel USE_GOOGLE_SEARCH_API
echo - Adicionados scripts para verificacao e correcao
echo - Criada documentacao atualizada para configuracao no Render
echo.

:: Perguntar se deseja personalizar a mensagem
set /p personalizar=Deseja personalizar a mensagem de commit? (S/N): 

if /i "!personalizar!"=="S" (
    set /p mensagem=Digite a mensagem de commit: 
    echo.
    echo Nova mensagem: !mensagem!
)

:: Adicionar todos os arquivos
echo Adicionando arquivos ao staging...
git add .

:: Verificar se há arquivos para commit
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo.
    echo ⚠️ Nenhuma alteracao detectada para commit.
    echo Verifique se os arquivos foram modificados ou se ja foram commitados anteriormente.
    echo.
    goto :perguntar_push
)

:: Realizar commit
echo.
echo Realizando commit...
git commit -m "%mensagem%" -m "%descricao%"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao realizar commit. Verifique as mensagens acima.
    goto :fim
)

:perguntar_push
:: Perguntar se deseja fazer push
set /p fazer_push=Deseja fazer push das alteracoes para o repositorio remoto? (S/N): 

if /i "!fazer_push!"=="S" (
    echo.
    echo Realizando push...
    git push
    
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Erro ao realizar push. Verifique as mensagens acima.
        goto :fim
    )
    
    echo.
    echo ✅ Push realizado com sucesso!
) else (
    echo.
    echo Push nao realizado. Suas alteracoes estao apenas no repositorio local.
)

:fim
echo.
echo =====================================================
echo    RESUMO DAS ACOES
echo =====================================================
echo.
echo Status atual do repositorio:
git status

echo.
echo ✅ Processo concluido!
echo.
pause
