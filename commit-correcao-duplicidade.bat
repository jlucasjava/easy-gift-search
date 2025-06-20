@echo off
echo Iniciando commit e push das alterações de correção de duplicidade de função...

git add backend/services/googleSearchService.js
git add CORRECAO_FUNCAO_DUPLICADA.md

git commit -m "Corrige erro de função duplicada - resolvendo problema de deploy"

git push origin production

echo Commit e push concluídos com sucesso!
echo Agora o deploy deve funcionar corretamente no ambiente de produção.
pause
