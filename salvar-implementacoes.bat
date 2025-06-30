@echo off
echo ======================================================
echo = SALVANDO TODAS AS IMPLEMENTAÇÕES REALIZADAS        =
echo ======================================================

echo.
echo Criando arquivo de log com todas as alterações...

:: Criar diretório para logs se não existir
if not exist logs mkdir logs

:: Definir timestamp para arquivos de log
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,8%-%dt:~8,6%"

:: Listar todos os arquivos criados/modificados
echo Arquivos criados ou modificados: > logs\alteracoes-%timestamp%.log
dir /s /b backend\benchmark-motores.js >> logs\alteracoes-%timestamp%.log
dir /s /b backend\diagnostico-completo.js >> logs\alteracoes-%timestamp%.log
dir /s /b backend\services\monitoringService.js >> logs\alteracoes-%timestamp%.log
dir /s /b backend\routes\monitoring.js >> logs\alteracoes-%timestamp%.log
dir /s /b frontend-integration-test.html >> logs\alteracoes-%timestamp%.log
dir /s /b RESUMO_NOVAS_IMPLEMENTACOES.md >> logs\alteracoes-%timestamp%.log
dir /s /b README_MOTORES_BUSCA.md >> logs\alteracoes-%timestamp%.log
dir /s /b testar-tudo.bat >> logs\alteracoes-%timestamp%.log
dir /s /b api\index.js >> logs\alteracoes-%timestamp%.log

echo.
echo Criando backup de todos os novos arquivos...

:: Criar diretório de backup
if not exist backup mkdir backup
if not exist backup\%timestamp% mkdir backup\%timestamp%

:: Copiar arquivos importantes para backup
echo Copiando arquivos para backup...
copy backend\benchmark-motores.js backup\%timestamp%\ > nul
copy backend\diagnostico-completo.js backup\%timestamp%\ > nul
copy backend\services\monitoringService.js backup\%timestamp%\ > nul
copy backend\routes\monitoring.js backup\%timestamp%\ > nul
copy frontend-integration-test.html backup\%timestamp%\ > nul
copy RESUMO_NOVAS_IMPLEMENTACOES.md backup\%timestamp%\ > nul
copy README_MOTORES_BUSCA.md backup\%timestamp%\ > nul
copy testar-tudo.bat backup\%timestamp%\ > nul
copy api\index.js backup\%timestamp%\ > nul
copy commit-message.txt backup\%timestamp%\ > nul

echo.
echo Backup concluído com sucesso em backup\%timestamp%\
echo Registro de alterações salvo em logs\alteracoes-%timestamp%.log

echo.
echo =======================================================
echo = IMPLEMENTAÇÕES SALVAS COM SUCESSO                   =
echo =======================================================
echo.
echo Não foi possível realizar o commit no git porque este 
echo diretório não está configurado como um repositório git.
echo.
echo Todos os arquivos foram salvos localmente para backup.
echo.
echo Para fazer o commit e push, você precisará:
echo 1. Inicializar um repositório git: git init
echo 2. Adicionar um remote: git remote add origin URL_DO_REPOSITORIO
echo 3. Adicionar os arquivos: git add .
echo 4. Fazer o commit: git commit -m "Mensagem de commit"
echo 5. Fazer o push: git push -u origin master
echo.
echo A mensagem de commit está salva em commit-message.txt
echo.
pause
