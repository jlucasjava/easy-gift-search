@echo off
echo Realizando commit das correções dos links de produtos simulados...

REM Adicionar os arquivos modificados
git add backend/services/simulateGoogleResults.js
git add backend/teste-links-simulados.js
git add backend/testar-integracao-frontend.js
git add testar-links-simulados.bat
git add testar-integracao-frontend.bat
git add CORRECAO_LINKS_PRODUTOS_SIMULADOS.md
git add README.md

REM Realizar o commit
git commit -m "Corrigir links de produtos simulados para apontar para marketplaces reais"

echo Commit realizado com sucesso!
echo Para enviar as alterações ao repositório remoto, execute: git push
pause
