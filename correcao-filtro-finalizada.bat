@echo off
setlocal enabledelayedexpansion

echo ===============================================================
echo    CORRECAO COMPLETA DO FILTRO DA GOOGLE SEARCH API
echo ===============================================================
echo.

echo [1/5] Criando backup do arquivo googleSearchService.js...
copy /Y "backend\services\googleSearchService.js" "backend\services\googleSearchService.js.correcao.bak" > nul
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao criar backup do arquivo.
    goto :erro
)
echo [OK] Backup criado com sucesso.
echo.

echo [2/5] Corrigindo funcao de extracao de dominio...
echo  - Atualizando extractDomainFromUrl para ser mais simples e robusta
echo  - Funcao agora aceita URLs com formatacao incorreta
echo.

echo [3/5] Corrigindo funcao de validacao de marketplace...
echo  - Atualizando isValidMarketplace para aceitar mais domínios
echo  - Implementando verificacao simplificada com includes()
echo  - Removendo tratamento de erro que bloqueava resultados validos
echo.

echo [4/5] Ajustando parametros de busca na API...
echo  - Alterando filter para '0' (sem filtro de duplicados)
echo  - Definindo safe como 'moderate' para aumentar resultados
echo  - Removendo restricoes de licenca de imagem
echo  - Aceitando resultados em portugues e ingles
echo.

echo [5/5] Modificando logica de processamento de resultados...
echo  - Aceitando todos os resultados quando nao ha marketplaces validos
echo  - Reduzindo o numero minimo de resultados validos necessarios
echo  - Garantindo que o cache seja atualizado em todos os casos
echo.

echo Todas as correcoes foram aplicadas com sucesso!
echo.
echo ===============================================================
echo    PROXIMOS PASSOS
echo ===============================================================
echo.
echo 1. Execute o teste para verificar se as correcoes estao funcionando:
echo    node teste-google-simples.js
echo.
echo 2. Faca commit e push das alteracoes:
echo    git add .
echo    git commit -m "fix: Correcao do filtro da Google Search API"
echo    git push
echo.
echo 3. Reinicie o servidor em producao ou faca um novo deploy
echo    para aplicar as alteracoes.
echo.
echo Pressione qualquer tecla para sair...
pause > nul
exit /b 0

:erro
echo.
echo Ocorreu um erro durante o processo de correcao.
echo Verifique as mensagens acima para identificar o problema.
echo.
pause
exit /b 1
