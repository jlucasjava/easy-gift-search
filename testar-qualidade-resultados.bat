@echo off
echo Testando qualidade dos resultados de busca...
echo.
cd backend
node teste-qualidade-resultados.js
echo.
echo Pressione qualquer tecla para fechar...
pause > nul
