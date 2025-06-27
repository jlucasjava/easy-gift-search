@echo off
echo ======================================
echo = COMMIT FINAL - MOTOR PERSONALIZADO =
echo ======================================

cd ..
echo.
echo Verificando status do repositório...
git status

echo.
echo Adicionando todos os arquivos...
git add .

echo.
echo Criando commit...
git commit -m "Implementação completa do motor de busca personalizado com scraping de marketplaces"

echo.
echo Realizando push para o repositório remoto...
git push

echo.
echo Processo concluído!
echo.
pause
