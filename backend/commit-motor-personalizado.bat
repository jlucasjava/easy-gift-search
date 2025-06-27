@echo off
echo ======================================
echo = COMMIT E PUSH - MOTOR PERSONALIZADO =
echo ======================================

cd ..
echo.
echo Verificando status do repositório...
git status

echo.
echo Adicionando arquivos modificados...
git add backend/services/customSearchService.js
git add backend/controllers/customSearchController.js
git add backend/routes/customSearch.js
git add api/index.js
git add backend/testar-custom-search.js
git add backend/testar-comparativo.js
git add MOTOR_BUSCA_PERSONALIZADO.md

echo.
echo Criando commit...
git commit -m "Implementação do motor de busca personalizado com scraping direto dos marketplaces"

echo.
echo Realizando push para o repositório remoto...
git push

echo.
echo Processo concluído!
echo.
pause
