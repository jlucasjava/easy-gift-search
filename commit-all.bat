@echo off
echo ======================================================
echo = COMMIT FINAL - FERRAMENTAS DE DIAGNÓSTICO E ANALISE =
echo ======================================================

echo.
echo Verificando status do repositório...
git status

echo.
echo Adicionando todos os arquivos...
git add .

echo.
echo Criando commit...
git commit -m "Implementação de ferramentas de diagnóstico, monitoramento e benchmark para motores de busca"

echo.
echo Realizando push para o repositório remoto...
git push

echo.
echo Processo concluído!
echo.
pause
