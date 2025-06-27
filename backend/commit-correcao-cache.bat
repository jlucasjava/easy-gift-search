@echo off
echo ======================================
echo = COMMIT CORREÇÃO CLEAR CACHE =
echo ======================================

cd ..
echo.
echo Adicionando arquivo corrigido...
git add backend/services/googleSearchService.js

echo.
echo Criando commit...
git commit -m "Corrige função clearCache no googleSearchService"

echo.
echo Realizando push...
git push

echo.
echo Processo concluído!
echo.
pause
