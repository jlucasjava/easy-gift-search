@echo off
echo *******************************************
echo *     COMMIT E PUSH DAS ALTERACOES       *
echo *******************************************
echo.

echo 1. Verificando status do Git...
git status
echo.

echo 2. Adicionando todos os arquivos...
git add .
echo.

echo 3. Comitando alteracoes com mensagem do arquivo...
git commit -F commit-message.txt
echo.

echo 4. Realizando push para o repositorio remoto...
git push
echo.

echo 5. Verificando status apos o push...
git status
echo.

echo Caso tenha havido algum problema com o push normal, pode ser necessario usar force push.
echo Deseja realizar um force push? (S/N)
set /p choice="Escolha: "
if /i "%choice%"=="S" (
    echo.
    echo Realizando force push...
    git push -f
    echo.
    echo Status apos force push:
    git status
)

echo.
echo *******************************************
echo *     CONFIGURACAO NO RENDER             *
echo *******************************************
echo.
echo IMPORTANTE: Configure as variaveis de ambiente no Render:
echo.
echo 1. Acesse o Dashboard do Render (https://dashboard.render.com/)
echo 2. Selecione seu servico "easy-gift-search"
echo 3. Clique na aba "Environment"
echo 4. Adicione as seguintes variaveis de ambiente:
echo.
echo    USE_GOOGLE_SEARCH_API=true
echo    GOOGLE_SEARCH_API_KEY=AIzaSyBs07nRYL0fYREou8gwDkS7fruBydwXfvI
echo    GOOGLE_SEARCH_CX=e17d0e713876e4dca
echo.
echo 5. Salve as alteracoes e faca um novo deploy
echo.
echo Para mais detalhes, consulte o arquivo RENDER_ENV_CONFIG.md
echo.
echo Processo finalizado!
echo Pressione qualquer tecla para sair...
pause > nul
