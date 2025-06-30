@echo off
echo ======================================================
echo EASY GIFT SEARCH - SUITE DE TESTES AUTOMATIZADOS
echo ======================================================
echo.

:: Criar diretório para logs se não existir
if not exist logs mkdir logs

:: Definir timestamp para arquivos de log
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,8%-%dt:~8,6%"

echo [%date% %time%] Iniciando suite de testes... > logs\teste-completo-%timestamp%.log

:: Testar o serviço de benchmark
echo.
echo [1/5] Executando benchmark de motores...
node backend\benchmark-motores.js >> logs\teste-completo-%timestamp%.log 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao executar benchmark de motores.
    echo [ERRO] Falha ao executar benchmark de motores. >> logs\teste-completo-%timestamp%.log
) else (
    echo [OK] Benchmark de motores concluído com sucesso.
    echo [OK] Benchmark de motores concluído com sucesso. >> logs\teste-completo-%timestamp%.log
)

:: Testar o diagnóstico completo
echo.
echo [2/5] Executando diagnóstico completo de motores...
node backend\diagnostico-completo.js >> logs\teste-completo-%timestamp%.log 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao executar diagnóstico completo.
    echo [ERRO] Falha ao executar diagnóstico completo. >> logs\teste-completo-%timestamp%.log
) else (
    echo [OK] Diagnóstico completo concluído com sucesso.
    echo [OK] Diagnóstico completo concluído com sucesso. >> logs\teste-completo-%timestamp%.log
)

:: Testar o motor original
echo.
echo [3/5] Testando Google Search API...
node backend\testar-google-search.js >> logs\teste-completo-%timestamp%.log 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao testar Google Search API.
    echo [ERRO] Falha ao testar Google Search API. >> logs\teste-completo-%timestamp%.log
) else (
    echo [OK] Teste de Google Search API concluído com sucesso.
    echo [OK] Teste de Google Search API concluído com sucesso. >> logs\teste-completo-%timestamp%.log
)

:: Testar o motor híbrido
echo.
echo [4/5] Testando motor híbrido...
node backend\testar-motor-hibrido.js >> logs\teste-completo-%timestamp%.log 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao testar motor híbrido.
    echo [ERRO] Falha ao testar motor híbrido. >> logs\teste-completo-%timestamp%.log
) else (
    echo [OK] Teste de motor híbrido concluído com sucesso.
    echo [OK] Teste de motor híbrido concluído com sucesso. >> logs\teste-completo-%timestamp%.log
)

:: Testar o motor CustomV2
echo.
echo [5/5] Testando Custom Search V2...
node backend\testar-custom-search-v2.js >> logs\teste-completo-%timestamp%.log 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao testar Custom Search V2.
    echo [ERRO] Falha ao testar Custom Search V2. >> logs\teste-completo-%timestamp%.log
) else (
    echo [OK] Teste de Custom Search V2 concluído com sucesso.
    echo [OK] Teste de Custom Search V2 concluído com sucesso. >> logs\teste-completo-%timestamp%.log
)

echo.
echo ======================================================
echo RESUMO DOS TESTES
echo ======================================================
echo.
echo Os resultados detalhados estão disponíveis em:
echo - benchmark-report.html
echo - diagnostico-report.html
echo - logs\teste-completo-%timestamp%.log
echo.
echo Recomendações:
echo 1. Abra benchmark-report.html para ver comparação detalhada
echo 2. Abra diagnostico-report.html para ver diagnóstico completo
echo 3. Verifique o log para identificar possíveis erros
echo.
echo Para iniciar o monitoramento em tempo real, execute:
echo   npm run start
echo.
echo Em seguida, acesse http://localhost:3000/monitoring/dashboard
echo.
echo Pressione qualquer tecla para encerrar...
pause > nul
