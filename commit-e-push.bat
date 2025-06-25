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
echo Processo finalizado!
echo Pressione qualquer tecla para sair...
pause > nul
